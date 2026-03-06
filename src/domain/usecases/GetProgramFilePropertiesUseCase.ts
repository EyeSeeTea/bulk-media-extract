import { FutureData } from "$/data/api-futures";
import { ProgramFileProperties } from "$/domain/entities/FileExportProgram";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";

export class GetProgramFilePropertiesUseCase {
    constructor(private options: { programRepository: ProgramRepository }) {}

    public execute(programId: string): FutureData<ProgramFileProperties> {
        return this.options.programRepository.getProgramFileProperties(programId);
    }
}
