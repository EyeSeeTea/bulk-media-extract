import { FutureData } from "$/data/api-futures";
import { StorageConnectionConfig, StorageRepository } from "$/domain/repositories/StorageRepository";

export class ValidateStorageConnectionUseCase {
    constructor(private options: { storageRepository: StorageRepository }) {}

    public execute(config: StorageConnectionConfig): FutureData<void> {
        return this.options.storageRepository.validateConnection(config);
    }
}
