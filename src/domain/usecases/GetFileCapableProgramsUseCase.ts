import { FutureData } from "$/data/api-futures";
import { FileCapableProgram } from "$/domain/entities/FileExportProgram";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";

export class GetFileCapableProgramsUseCase {
    constructor(private options: { programRepository: ProgramRepository }) {}

    public execute(): FutureData<FileCapableProgram[]> {
        return this.options.programRepository.getFileCapablePrograms();
    }
}
