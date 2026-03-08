import { Future } from "$/domain/entities/generic/Future";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramFileProperties,
    ProgramFileProperty,
} from "$/domain/entities/FileExportProgram";
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
                })
            ),
        getProgramEventsPreview: (_programId: string, _orgUnitId: string, _pageSize: number) =>
            Future.success<Error, ProgramEventPreview[]>([]),
        getOrganisationUnits: () => Future.success<Error, NamedRef[]>([]),
        ...overrides,
    };
}
