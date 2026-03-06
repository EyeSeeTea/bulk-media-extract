import { FutureData } from "$/data/api-futures";
import { ProgramEventPreview } from "$/domain/entities/FileExportProgram";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";

const DEFAULT_PREVIEW_PAGE_SIZE = 20;

export class GetProgramEventsPreviewUseCase {
    constructor(private options: { programRepository: ProgramRepository }) {}

    public execute(programId: string, orgUnitId: string, pageSize = DEFAULT_PREVIEW_PAGE_SIZE): FutureData<ProgramEventPreview[]> {
        return this.options.programRepository.getProgramEventsPreview(programId, orgUnitId, pageSize);
    }
}
