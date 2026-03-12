import { Future } from "$/domain/entities/generic/Future";
import { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";
import { FileCapableProgram } from "$/domain/entities/FileCapableProgram";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";
import { GetProgramFilePropertiesUseCase } from "$/domain/usecases/GetProgramFilePropertiesUseCase";
import { describe, expect, it } from "vitest";

describe("GetProgramFilePropertiesUseCase", () => {
    it("returns program details", async () => {
        const useCase = new GetProgramFilePropertiesUseCase({
            programRepository: buildProgramRepository({
                getProgramFileProperties: () =>
                    Future.success(
                        new ProgramFileProperties({
                            program: new FileCapableProgram({
                                id: "program-1",
                                name: "Program 1",
                                programType: "WITH_REGISTRATION",
                                organisationUnits: [],
                            }),
                            properties: [
                                new ProgramFileProperty({
                                    id: "de-1",
                                    name: "Attachment",
                                    valueType: "FILE_RESOURCE",
                                    sourceType: "dataElement",
                                }),
                            ],
                            propertyGroups: [],
                        })
                    ),
            }),
        });

        const details = await useCase.execute("program-1").toPromise();

        expect(details.program.id).toBe("program-1");
        expect(details.properties).toHaveLength(1);
    });

    it("returns empty property list", async () => {
        const useCase = new GetProgramFilePropertiesUseCase({
            programRepository: buildProgramRepository({
                getProgramFileProperties: () =>
                    Future.success(
                        new ProgramFileProperties({
                            program: new FileCapableProgram({
                                id: "program-2",
                                name: "Program 2",
                                programType: "WITHOUT_REGISTRATION",
                                organisationUnits: [],
                            }),
                            properties: [],
                            propertyGroups: [],
                        })
                    ),
            }),
        });

        const details = await useCase.execute("program-2").toPromise();

        expect(details.properties).toEqual([]);
    });

    it("propagates repository failures", async () => {
        const useCase = new GetProgramFilePropertiesUseCase({
            programRepository: buildProgramRepository({
                getProgramFileProperties: () => Future.error(new Error("not-found")),
            }),
        });

        await expect(useCase.execute("program-404").toPromise()).rejects.toThrow("not-found");
    });
});

function buildProgramRepository(overrides: Partial<ProgramRepository>): ProgramRepository {
    return {
        getFileCapablePrograms: () => Future.success([]),
        getProgramFileProperties: (_programId: string) =>
            Future.success(
                new ProgramFileProperties({
                    program: new FileCapableProgram({
                        id: "",
                        name: "",
                        programType: "UNKNOWN",
                        organisationUnits: [],
                    }),
                    properties: [],
                    propertyGroups: [],
                })
            ),
        getProgramEventsPreview: (
            _programId: string,
            _orgUnitId: string,
            _orgUnitMode: OrgUnitSelectionMode,
            _programStageId: string | undefined,
            _fileDataElementId: string | undefined,
            _pageSize: number,
            _loadAllPages?: boolean
        ) =>
            Future.success<Error, ProgramEventsPreviewResult>(
                new ProgramEventsPreviewResult({ events: [] })
            ),
        getOrganisationUnits: () => Future.success<Error, NamedRef[]>([]),
        ...overrides,
    };
}
