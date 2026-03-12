import { Future } from "$/domain/entities/generic/Future";
import { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";
import { FileCapableProgram } from "$/domain/entities/FileCapableProgram";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";
import { GetFileCapableProgramsUseCase } from "$/domain/usecases/GetFileCapableProgramsUseCase";
import { describe, expect, it } from "vitest";

describe("GetFileCapableProgramsUseCase", () => {
    it("returns programs", async () => {
        const useCase = new GetFileCapableProgramsUseCase({
            programRepository: buildProgramRepository({
                getFileCapablePrograms: () =>
                    Future.success([
                        new FileCapableProgram({
                            id: "program-1",
                            name: "Program 1",
                            programType: "WITH_REGISTRATION",
                            organisationUnits: [],
                        }),
                    ]),
            }),
        });

        const programs = await useCase.execute().toPromise();

        expect(programs).toHaveLength(1);
        expect(programs[0]?.id).toBe("program-1");
    });

    it("returns empty when there are no file-capable programs", async () => {
        const useCase = new GetFileCapableProgramsUseCase({
            programRepository: buildProgramRepository({
                getFileCapablePrograms: () => Future.success([]),
            }),
        });

        const programs = await useCase.execute().toPromise();

        expect(programs).toEqual([]);
    });

    it("propagates repository failures", async () => {
        const useCase = new GetFileCapableProgramsUseCase({
            programRepository: buildProgramRepository({
                getFileCapablePrograms: () => Future.error(new Error("boom")),
            }),
        });

        await expect(useCase.execute().toPromise()).rejects.toThrow("boom");
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
