import { FutureData } from "$/data/api-futures";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";

export class GetOrganisationUnitsUseCase {
    constructor(private options: { programRepository: ProgramRepository }) {}

    public execute(): FutureData<NamedRef[]> {
        return this.options.programRepository.getOrganisationUnits();
    }
}
