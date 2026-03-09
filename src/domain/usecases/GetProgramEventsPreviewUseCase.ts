import { FutureData } from "$/data/api-futures";
import { ProgramEventsPreviewResult } from "$/domain/entities/FileExportProgram";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";

const DEFAULT_PREVIEW_PAGE_SIZE = 10;

export class GetProgramEventsPreviewUseCase {
    constructor(private options: { programRepository: ProgramRepository }) {}

    public execute(
        programId: string,
        orgUnitId: string,
        orgUnitMode: "selected" | "descendants" = "selected",
        programStageId?: string,
        fileDataElementId?: string,
        pageSize = DEFAULT_PREVIEW_PAGE_SIZE,
        loadAllPages = false
    ): FutureData<ProgramEventsPreviewResult> {
        return this.options.programRepository.getProgramEventsPreview(
            programId,
            orgUnitId,
            orgUnitMode,
            programStageId,
            fileDataElementId,
            pageSize,
            loadAllPages
        );
    }
}
