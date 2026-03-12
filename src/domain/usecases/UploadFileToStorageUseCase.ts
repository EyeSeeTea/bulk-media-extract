import { FutureData } from "$/data/api-futures";
import { StorageUploadRequest } from "$/application/storage/StorageContracts";
import { StorageRepository } from "$/domain/repositories/StorageRepository";

export class UploadFileToStorageUseCase {
    constructor(private options: { storageRepository: StorageRepository }) {}

    public execute(request: StorageUploadRequest): FutureData<void> {
        return this.options.storageRepository.uploadFile(request);
    }
}
