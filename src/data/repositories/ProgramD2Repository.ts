import { apiToFuture, FutureData } from "$/data/api-futures";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramFileProperties,
    ProgramFileProperty,
    ProgramType,
} from "$/domain/entities/FileExportProgram";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";
import { D2Api } from "$/types/d2-api";

const FILE_VALUE_TYPES = new Set(["FILE_RESOURCE", "IMAGE"]);

export class ProgramD2Repository implements ProgramRepository {
    constructor(private api: D2Api) {}

    public getFileCapablePrograms(): FutureData<FileCapableProgram[]> {
        return this.getProgramMetadata().map(programs => {
            return programs
                .map(program => this.buildProgramFileProperties(program))
                .filter(details => details.properties.length > 0)
                .map(details => details.program)
                .sort((a, b) => a.name.localeCompare(b.name));
        });
    }

    public getProgramFileProperties(programId: string): FutureData<ProgramFileProperties> {
        return this.getProgramMetadata(programId).map(programs => {
            const program = programs[0];
            if (!program) {
                throw new Error(`Program not found: ${programId}`);
            }
            return this.buildProgramFileProperties(program);
        });
    }

    public getProgramEventsPreview(
        programId: string,
        orgUnitId: string,
        pageSize: number
    ): FutureData<ProgramEventPreview[]> {
        const query = toQueryString({
            program: programId,
            orgUnit: orgUnitId,
            pageSize: String(pageSize),
            page: "1",
            totalPages: "false",
            order: "eventDate:desc",
            fields: "event,eventDate,occurredAt,orgUnit,dataValues[dataElement,value]",
        });

        return this.get<D2EventsResponse>(`/events?${query}`).map(response => {
            return (response.events ?? []).map(event => {
                const fileValues = (event.dataValues ?? []).reduce<Record<string, string>>(
                    (acc, dataValue) => {
                        const value = dataValue.value ?? "";
                        if (value) {
                            acc[dataValue.dataElement] = value;
                        }
                        return acc;
                    },
                    {}
                );

                return new ProgramEventPreview({
                    id: event.event,
                    eventDate: event.eventDate ?? event.occurredAt ?? null,
                    orgUnitId: event.orgUnit,
                    fileValues,
                });
            });
        });
    }

    public getOrganisationUnits(): FutureData<NamedRef[]> {
        const query = toQueryString({
            fields: "id,displayName,path",
            pageSize: "200",
            page: "1",
            totalPages: "false",
            order: "displayName:asc",
        });

        return this.get<D2OrgUnitsResponse>(`/organisationUnits?${query}`).map(response => {
            return (response.organisationUnits ?? []).map(orgUnit => ({
                id: orgUnit.id,
                name: orgUnit.displayName,
                path: orgUnit.path,
            }));
        });
    }

    private getProgramMetadata(programId?: string): FutureData<D2Program[]> {
        const filter = programId ? `id:eq:${programId}` : undefined;
        const query = toQueryString({
            fields: [
                "id",
                "displayName",
                "programType",
                "organisationUnits[id,displayName,path]",
                "programTrackedEntityAttributes[trackedEntityAttribute[id,displayName,valueType]]",
                "programStages[id,displayName,programStageDataElements[dataElement[id,displayName,valueType]]]",
            ].join(","),
            pageSize: "500",
            page: "1",
            totalPages: "false",
            filter,
        });

        return this.get<D2ProgramsResponse>(`/programs?${query}`).map(
            response => response.programs ?? []
        );
    }

    private buildProgramFileProperties(program: D2Program): ProgramFileProperties {
        const eventProperties: ProgramFileProperty[] = (program.programStages ?? []).flatMap(
            stage => {
                return (stage.programStageDataElements ?? [])
                    .map(psde => psde.dataElement)
                    .filter(isDefined)
                    .filter(dataElement => FILE_VALUE_TYPES.has(dataElement.valueType))
                    .map(dataElement => {
                        return new ProgramFileProperty({
                            id: dataElement.id,
                            name: dataElement.displayName,
                            valueType: dataElement.valueType,
                            sourceType: "dataElement",
                            sourceContainerId: stage.id,
                            sourceContainerName: stage.displayName,
                        });
                    });
            }
        );

        const teiProperties: ProgramFileProperty[] = (program.programTrackedEntityAttributes ?? [])
            .map(entry => entry.trackedEntityAttribute)
            .filter(isDefined)
            .filter(attribute => FILE_VALUE_TYPES.has(attribute.valueType))
            .map(attribute => {
                return new ProgramFileProperty({
                    id: attribute.id,
                    name: attribute.displayName,
                    valueType: attribute.valueType,
                    sourceType: "trackedEntityAttribute",
                });
            });

        const properties = [...eventProperties, ...teiProperties];

        return new ProgramFileProperties({
            program: new FileCapableProgram({
                id: program.id,
                name: program.displayName,
                programType: normalizeProgramType(program.programType),
                organisationUnits: (program.organisationUnits ?? []).map(orgUnit => ({
                    id: orgUnit.id,
                    name: orgUnit.displayName,
                    path: orgUnit.path,
                })),
            }),
            properties,
        });
    }

    private get<Data>(path: string): FutureData<Data> {
        return apiToFuture(this.api.get<Data>(path));
    }
}

function toQueryString(params: Record<string, string | undefined>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, value);
        }
    });

    return searchParams.toString();
}

function normalizeProgramType(programType?: string): ProgramType {
    if (programType === "WITH_REGISTRATION" || programType === "WITHOUT_REGISTRATION") {
        return programType;
    }
    return "UNKNOWN";
}

function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

type D2ProgramsResponse = {
    programs?: D2Program[];
};

type D2Program = {
    id: string;
    displayName: string;
    programType?: string;
    organisationUnits?: Array<{
        id: string;
        displayName: string;
        path?: string;
    }>;
    programStages?: Array<{
        id: string;
        displayName: string;
        programStageDataElements?: Array<{
            dataElement?: {
                id: string;
                displayName: string;
                valueType: string;
            };
        }>;
    }>;
    programTrackedEntityAttributes?: Array<{
        trackedEntityAttribute?: {
            id: string;
            displayName: string;
            valueType: string;
        };
    }>;
};

type D2EventsResponse = {
    events?: Array<{
        event: string;
        eventDate?: string;
        occurredAt?: string;
        orgUnit: string;
        dataValues?: Array<{
            dataElement: string;
            value?: string;
        }>;
    }>;
};

type D2OrgUnitsResponse = {
    organisationUnits?: Array<{
        id: string;
        displayName: string;
        path?: string;
    }>;
};
