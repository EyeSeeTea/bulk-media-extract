import { apiToFuture, FutureData } from "$/data/api-futures";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramEventsPreviewResult,
    ProgramFileProperties,
    ProgramFilePropertyGroup,
    ProgramFileProperty,
    ProgramType,
} from "$/domain/entities/FileExportProgram";
import { Future } from "$/domain/entities/generic/Future";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";
import { D2Api } from "$/types/d2-api";

const FILE_VALUE_TYPES = new Set(["FILE_RESOURCE", "IMAGE"]);

export class ProgramD2Repository implements ProgramRepository {
    private fileResourceNameCache = new Map<string, string>();
    private fileResourceSizeCache = new Map<string, number>();
    private orgUnitNameCache = new Map<string, string>();

    constructor(private api: D2Api) {}

    public getFileCapablePrograms(): FutureData<FileCapableProgram[]> {
        return this.getProgramMetadata().map(programs => {
            return programs
                .filter(program => this.hasFileCapableProperty(program))
                .map(program => this.buildProgram(program))
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
        orgUnitMode: "selected" | "descendants",
        programStageId: string | undefined,
        fileDataElementId: string | undefined,
        pageSize: number,
        loadAllPages = false
    ): FutureData<ProgramEventsPreviewResult> {
        return Future.block(async $ => {
            const getEventsPage = (page: number): FutureData<D2TrackerEventsResponse> =>
                apiToFuture<D2TrackerEventsResponse>(
                    this.api.tracker.events.get({
                        program: programId,
                        programStage: programStageId,
                        filter: toTrackerDataElementGreaterThanOneFilter(fileDataElementId),
                        orgUnit: orgUnitId,
                        ouMode: toTrackerOrgUnitMode(orgUnitMode),
                        pageSize,
                        page,
                        totalPages: false,
                        order: "occurredAt:desc",
                        fields: {
                            event: true,
                            trackedEntity: true,
                            occurredAt: true,
                            scheduledAt: true,
                            orgUnit: true,
                            orgUnitName: true,
                            dataValues: {
                                dataElement: true,
                                value: true,
                            },
                        },
                    })
                );

            const [programs, firstResponse] = await $(
                Future.join2(this.getProgramMetadata(programId), getEventsPage(1))
            );
            const program = programs[0];
            const responses = [firstResponse];
            if (loadAllPages) {
                const total = firstResponse.total ?? firstResponse.pager?.total;
                const seenEventIds = new Set(
                    (firstResponse.instances ?? firstResponse.events ?? []).map(event => event.event)
                );
                let lastPageEvents = firstResponse.instances ?? firstResponse.events ?? [];
                let accumulatedCount = lastPageEvents.length;
                let nextPage = 2;
                let guard = 0;

                while (guard < 100) {
                    const reachedKnownTotal = total !== undefined && accumulatedCount >= total;
                    if (reachedKnownTotal || lastPageEvents.length < pageSize) {
                        break;
                    }

                    const nextResponse = await $(getEventsPage(nextPage));
                    const nextPageEvents = nextResponse.instances ?? nextResponse.events ?? [];
                    if (nextPageEvents.length === 0) {
                        break;
                    }

                    const hasNewEvent = nextPageEvents.some(event => !seenEventIds.has(event.event));
                    responses.push(nextResponse);
                    nextPageEvents.forEach(event => seenEventIds.add(event.event));
                    accumulatedCount += nextPageEvents.length;
                    lastPageEvents = nextPageEvents;
                    nextPage += 1;
                    guard += 1;

                    if (!hasNewEvent) {
                        break;
                    }
                }
            }
            const events = responses.flatMap(response => response.instances ?? response.events ?? []);
            const fileDataElementIds = new Set(
                (program?.programStages ?? []).flatMap(stage => {
                    return (stage.programStageDataElements ?? [])
                        .map(psde => psde.dataElement)
                        .filter(isDefined)
                        .filter(dataElement => FILE_VALUE_TYPES.has(dataElement.valueType))
                        .map(dataElement => dataElement.id);
                })
            );
            const fileResourceIds = Array.from(
                new Set(
                    events.flatMap(event => {
                        return (event.dataValues ?? [])
                            .filter(dataValue => fileDataElementIds.has(dataValue.dataElement))
                            .map(dataValue => dataValue.value ?? "")
                            .filter(Boolean);
                    })
                )
            );

            const fileResources = await $(
                Future.parallel<Error, { id: string; fileName?: string; fileSize?: number }>(
                    fileResourceIds.map(fileResourceId => {
                        const cachedFileName = this.fileResourceNameCache.get(fileResourceId);
                        const cachedFileSize = this.fileResourceSizeCache.get(fileResourceId);
                        if (cachedFileName || cachedFileSize !== undefined) {
                            return Future.success({
                                id: fileResourceId,
                                fileName: cachedFileName,
                                fileSize: cachedFileSize,
                            });
                        }

                        return this.get<D2FileResource>(
                            `/fileResources/${fileResourceId}?fields=id,name,originalName,contentLength`
                        )
                            .map<{ id: string; fileName?: string; fileSize?: number }>(fileResource => {
                                const fileName =
                                    fileResource.originalName ?? fileResource.name ?? fileResourceId;
                                const fileSize = normalizeContentLength(fileResource.contentLength);
                                this.fileResourceNameCache.set(fileResourceId, fileName);
                                if (fileSize !== undefined) {
                                    this.fileResourceSizeCache.set(fileResourceId, fileSize);
                                }
                                return {
                                    id: fileResourceId,
                                    fileName,
                                    fileSize,
                                };
                            })
                            .flatMapError(() => {
                                return Future.success<
                                    Error,
                                    { id: string; fileName?: string; fileSize?: number }
                                >({
                                    id: fileResourceId,
                                });
                            });
                    }),
                    { concurrency: 4 }
                )
            );

            const fileNameById = Object.fromEntries(
                fileResources
                    .filter((fileResource): fileResource is { id: string; fileName: string } =>
                        Boolean(fileResource.fileName)
                    )
                    .map(fileResource => [fileResource.id, fileResource.fileName])
            );
            const fileSizeById = Object.fromEntries(
                fileResources
                    .filter((fileResource): fileResource is { id: string; fileSize: number } =>
                        fileResource.fileSize !== undefined
                    )
                    .map(fileResource => [fileResource.id, fileResource.fileSize])
            );
            const trackedEntityIds = Array.from(
                new Set(
                    events
                        .map(event => event.trackedEntity)
                        .filter(isDefined)
                        .filter(Boolean)
                )
            );
            const trackedEntities = trackedEntityIds.length
                ? await $(
                      apiToFuture<D2TrackerTrackedEntitiesResponse>(
                          this.api.tracker.trackedEntities.get({
                              program: programId,
                              trackedEntity: trackedEntityIds.join(";"),
                              ouMode: "ACCESSIBLE",
                              skipPaging: true,
                              fields: {
                                  attributes: {
                                      attribute: true,
                                      value: true,
                                  },
                                  trackedEntity: true,
                              },
                          })
                      )
                  )
                : { instances: [] };
            const trackedEntityRows =
                trackedEntities.instances ?? trackedEntities.trackedEntities ?? [];
            const attributeValuesByTrackedEntityId = Object.fromEntries(
                trackedEntityRows.map(trackedEntity => [
                    trackedEntity.trackedEntity,
                    Object.fromEntries(
                        (trackedEntity.attributes ?? [])
                            .filter(attribute => Boolean(attribute.attribute))
                            .map(attribute => [attribute.attribute, String(attribute.value ?? "")])
                    ),
                ])
            );
            const orgUnitIds = Array.from(
                new Set(events.map(event => event.orgUnit).filter(Boolean).filter(isDefined))
            );
            const orgUnits = await $(
                Future.parallel<Error, { id: string; name?: string }>(
                    orgUnitIds.map(eventOrgUnitId => {
                        const cachedName = this.orgUnitNameCache.get(eventOrgUnitId);
                        if (cachedName) {
                            return Future.success({
                                id: eventOrgUnitId,
                                name: cachedName,
                            });
                        }

                        return this.get<D2OrgUnit>(
                            `/organisationUnits/${eventOrgUnitId}?fields=id,displayName`
                        )
                            .map<{ id: string; name?: string }>(orgUnit => {
                                const name = orgUnit.displayName;
                                if (name) {
                                    this.orgUnitNameCache.set(eventOrgUnitId, name);
                                }
                                return {
                                    id: eventOrgUnitId,
                                    name,
                                };
                            })
                            .flatMapError(() => {
                                return Future.success<Error, { id: string; name?: string }>({
                                    id: eventOrgUnitId,
                                });
                            });
                    }),
                    { concurrency: 4 }
                )
            );
            const orgUnitNameById = Object.fromEntries(
                orgUnits
                    .filter((orgUnit): orgUnit is { id: string; name: string } =>
                        Boolean(orgUnit.name)
                    )
                    .map(orgUnit => [orgUnit.id, orgUnit.name])
            );

            const previewEvents = events.map(event => {
                const dataValues = (event.dataValues ?? []).reduce<Record<string, string>>(
                    (acc, dataValue) => {
                        const value = dataValue.value ?? "";
                        if (value) {
                            acc[dataValue.dataElement] = value;
                        }
                        return acc;
                    },
                    {}
                );
                const fileNames = Object.fromEntries(
                    Object.entries(dataValues)
                        .filter(([dataElementId]) => fileDataElementIds.has(dataElementId))
                        .flatMap(([dataElementId, fileResourceId]) => {
                            const fileName = fileNameById[fileResourceId];
                            return fileName ? [[dataElementId, fileName] as const] : [];
                        })
                );
                const fileSizes = Object.fromEntries(
                    Object.entries(dataValues)
                        .filter(([dataElementId]) => fileDataElementIds.has(dataElementId))
                        .flatMap(([dataElementId, fileResourceId]) => {
                            const fileSize = fileSizeById[fileResourceId];
                            return fileSize === undefined
                                ? []
                                : [[dataElementId, fileSize] as const];
                        })
                );

                return new ProgramEventPreview({
                    id: event.event,
                    eventDate:
                        event.occurredAt ?? event.eventDate ?? event.scheduledAt ?? null,
                    orgUnitId: event.orgUnit,
                    orgUnitName: event.orgUnitName ?? orgUnitNameById[event.orgUnit],
                    dataValues,
                    attributeValues: event.trackedEntity
                        ? attributeValuesByTrackedEntityId[event.trackedEntity] ?? {}
                        : {},
                    fileValues: dataValues,
                    fileNames,
                    fileSizes,
                });
            });

            return new ProgramEventsPreviewResult({
                events: previewEvents,
                total: firstResponse.total ?? firstResponse.pager?.total,
                pageCount: firstResponse.pageCount ?? firstResponse.pager?.pageCount,
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
        const programType = normalizeProgramType(program.programType);
        const metadataProperties = buildMetadataProperties();
        const eventPropertiesByStage = this.buildStageGroups(program);
        const eventProperties = eventPropertiesByStage.flatMap(group => group.properties);
        const teiProperties = this.buildTrackedEntityProperties(program);
        const propertyGroups: ProgramFilePropertyGroup[] =
            programType === "WITH_REGISTRATION"
                ? [
                      ...metadataProperties.groups,
                      ...teiProperties.groups,
                      ...eventPropertiesByStage,
                  ]
                : [...metadataProperties.groups, ...this.buildEventProgramGroup(eventProperties)];

        const properties = propertyGroups.flatMap(group => group.properties);

        return new ProgramFileProperties({
            program: this.buildProgram(program),
            properties,
            propertyGroups,
        });
    }

    private buildProgram(program: D2Program): FileCapableProgram {
        return new FileCapableProgram({
            id: program.id,
            name: program.displayName,
            programType: normalizeProgramType(program.programType),
            organisationUnits: (program.organisationUnits ?? []).map(orgUnit => ({
                id: orgUnit.id,
                name: orgUnit.displayName,
                path: orgUnit.path,
            })),
        });
    }

    private buildTrackedEntityProperties(program: D2Program): {
        groups: ProgramFilePropertyGroup[];
        properties: ProgramFileProperty[];
    } {
        const properties: ProgramFileProperty[] = (program.programTrackedEntityAttributes ?? [])
            .map(entry => entry.trackedEntityAttribute)
            .filter(isDefined)
            .map(attribute => {
                return new ProgramFileProperty({
                    id: attribute.id,
                    name: attribute.displayName,
                    valueType: attribute.valueType,
                    sourceType: "trackedEntityAttribute",
                });
            });

        const groups =
            properties.length > 0
                ? [
                      new ProgramFilePropertyGroup({
                          id: "trackedEntityAttributes",
                          name: "Tracked entity attributes",
                          sourceType: "trackedEntityAttribute",
                          properties,
                      }),
                  ]
                : [];

        return { groups, properties };
    }

    private buildStageGroups(program: D2Program): ProgramFilePropertyGroup[] {
        return (program.programStages ?? [])
            .map(stage => {
                const properties: ProgramFileProperty[] = (stage.programStageDataElements ?? [])
                    .map(psde => psde.dataElement)
                    .filter(isDefined)
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

                return new ProgramFilePropertyGroup({
                    id: stage.id,
                    name: stage.displayName,
                    sourceType: "dataElement",
                    properties,
                });
            })
            .filter(group => group.properties.length > 0);
    }

    private buildEventProgramGroup(properties: ProgramFileProperty[]): ProgramFilePropertyGroup[] {
        if (properties.length === 0) {
            return [];
        }

        return [
            new ProgramFilePropertyGroup({
                id: "eventDataElements",
                name: "Event data elements",
                sourceType: "dataElement",
                properties,
            }),
        ];
    }

    private hasFileCapableProperty(program: D2Program): boolean {
        const hasFileStageDataElement = (program.programStages ?? []).some(stage =>
            (stage.programStageDataElements ?? [])
                .map(psde => psde.dataElement)
                .filter(isDefined)
                .some(dataElement => FILE_VALUE_TYPES.has(dataElement.valueType))
        );

        if (hasFileStageDataElement) {
            return true;
        }

        return (program.programTrackedEntityAttributes ?? [])
            .map(entry => entry.trackedEntityAttribute)
            .filter(isDefined)
            .some(attribute => FILE_VALUE_TYPES.has(attribute.valueType));
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

function toTrackerOrgUnitMode(orgUnitMode: "selected" | "descendants"): "SELECTED" | "DESCENDANTS" {
    return orgUnitMode === "selected" ? "SELECTED" : "DESCENDANTS";
}

function toTrackerDataElementGreaterThanOneFilter(fileDataElementId?: string): string | undefined {
    return fileDataElementId ? `${fileDataElementId}:gt:1` : undefined;
}

function isDefined<T>(value: T | undefined | null): value is T {
    return value !== undefined && value !== null;
}

function buildMetadataProperties(): {
    groups: ProgramFilePropertyGroup[];
    properties: ProgramFileProperty[];
} {
    const properties = [
        new ProgramFileProperty({
            id: "orgUnitName",
            name: "Organisation unit name",
            valueType: "TEXT",
            sourceType: "metadata",
        }),
        new ProgramFileProperty({
            id: "orgUnitId",
            name: "Organisation unit id",
            valueType: "TEXT",
            sourceType: "metadata",
        }),
        new ProgramFileProperty({
            id: "enrollmentDate",
            name: "Enrollment/event date",
            valueType: "DATE",
            sourceType: "metadata",
        }),
    ];

    return {
        properties,
        groups: [
            new ProgramFilePropertyGroup({
                id: "metadata",
                name: "Metadata",
                sourceType: "metadata",
                properties,
            }),
        ],
    };
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

type D2TrackerEventsResponse = {
    total?: number;
    pageCount?: number;
    pager?: {
        page?: number;
        pageSize?: number;
        total?: number;
        pageCount?: number;
    };
    instances?: Array<{
        event: string;
        trackedEntity?: string;
        occurredAt?: string;
        scheduledAt?: string;
        eventDate?: string;
        orgUnit: string;
        orgUnitName?: string;
        dataValues?: Array<{
            dataElement: string;
            value?: string;
        }>;
    }>;
    events?: Array<{
        event: string;
        trackedEntity?: string;
        occurredAt?: string;
        scheduledAt?: string;
        eventDate?: string;
        orgUnit: string;
        orgUnitName?: string;
        dataValues?: Array<{
            dataElement: string;
            value?: string;
        }>;
    }>;
};

type D2TrackerTrackedEntitiesResponse = {
    instances?: Array<{
        trackedEntity: string;
        attributes?: Array<{
            attribute: string;
            value?: string | number | Date;
        }>;
    }>;
    trackedEntities?: Array<{
        trackedEntity: string;
        attributes?: Array<{
            attribute: string;
            value?: string | number | Date;
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

type D2OrgUnit = {
    id: string;
    displayName?: string;
};

type D2FileResource = {
    id: string;
    name?: string;
    originalName?: string;
    contentLength?: number | string;
};

function normalizeContentLength(value?: number | string): number | undefined {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }

    return undefined;
}
