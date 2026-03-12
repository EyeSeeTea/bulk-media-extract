import { FutureData } from "$/data/api-futures";
import { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";

const DEFAULT_PREVIEW_PAGE_SIZE = 10;

export class GetProgramEventsPreviewUseCase {
    constructor(private options: { programRepository: ProgramRepository }) {}

    public execute(
        programId: string,
        orgUnitId: string,
        orgUnitMode: OrgUnitSelectionMode = "selected",
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
