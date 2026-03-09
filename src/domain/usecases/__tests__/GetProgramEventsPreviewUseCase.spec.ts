import { Future } from "$/domain/entities/generic/Future";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramEventsPreviewResult,
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
                    Future.success(
                        new ProgramEventsPreviewResult({
                            events: [
                                new ProgramEventPreview({
                                    id: "event-1",
                                    eventDate: "2026-01-01",
                                    orgUnitId: "ou-1",
                                    dataValues: { "de-1": "file-1" },
                                    attributeValues: { "attr-1": "value-1" },
                                    fileValues: { "de-1": "file-1" },
                                    fileNames: { "de-1": "file-1.pdf" },
                                }),
                            ],
                            total: 1,
                            pageCount: 1,
                        })
                    ),
            }),
        });

        const events = await useCase
            .execute("program-1", "ou-1", "descendants", "stage-1", "de-1")
            .toPromise();

        expect(events.events).toHaveLength(1);
        expect(events.events[0]?.id).toBe("event-1");
        expect(events.total).toBe(1);
    });

    it("returns empty preview when no events exist", async () => {
        const useCase = new GetProgramEventsPreviewUseCase({
            programRepository: buildProgramRepository({
                getProgramEventsPreview: () =>
                    Future.success(new ProgramEventsPreviewResult({ events: [] })),
            }),
        });

        const events = await useCase.execute("program-1", "ou-1", "selected").toPromise();

        expect(events.events).toEqual([]);
    });

    it("propagates preview failures", async () => {
        const useCase = new GetProgramEventsPreviewUseCase({
            programRepository: buildProgramRepository({
                getProgramEventsPreview: () => Future.error(new Error("preview-error")),
            }),
        });

        await expect(useCase.execute("program-1", "ou-1", "selected").toPromise()).rejects.toThrow(
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
                    propertyGroups: [],
                })
            ),
        getProgramEventsPreview: (
            _programId: string,
            _orgUnitId: string,
            _orgUnitMode: "selected" | "descendants",
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
