import { Future } from "$/domain/entities/generic/Future";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramFileProperties,
} from "$/domain/entities/FileExportProgram";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";
import { GetProgramEventsPreviewUseCase } from "$/domain/usecases/GetProgramEventsPreviewUseCase";
import { describe, expect, it } from "vitest";

describe("GetProgramEventsPreviewUseCase", () => {
    it("returns event preview", async () => {
        const useCase = new GetProgramEventsPreviewUseCase({
            programRepository: buildProgramRepository({
                getProgramEventsPreview: () =>
                    Future.success([
                        new ProgramEventPreview({
                            id: "event-1",
                            eventDate: "2026-01-01",
                            orgUnitId: "ou-1",
                            fileValues: { "de-1": "file-1" },
                        }),
                    ]),
            }),
        });

        const events = await useCase.execute("program-1", "ou-1").toPromise();

        expect(events).toHaveLength(1);
        expect(events[0]?.id).toBe("event-1");
    });

    it("returns empty preview when no events exist", async () => {
        const useCase = new GetProgramEventsPreviewUseCase({
            programRepository: buildProgramRepository({
                getProgramEventsPreview: () => Future.success([]),
            }),
        });

        const events = await useCase.execute("program-1", "ou-1").toPromise();

        expect(events).toEqual([]);
    });

    it("propagates preview failures", async () => {
        const useCase = new GetProgramEventsPreviewUseCase({
            programRepository: buildProgramRepository({
                getProgramEventsPreview: () => Future.error(new Error("preview-error")),
            }),
        });

        await expect(useCase.execute("program-1", "ou-1").toPromise()).rejects.toThrow(
            "preview-error"
        );
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
