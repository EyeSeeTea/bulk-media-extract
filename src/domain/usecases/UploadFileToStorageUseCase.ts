import { FutureData } from "$/data/api-futures";
import { StorageRepository, StorageUploadRequest } from "$/domain/repositories/StorageRepository";

export class UploadFileToStorageUseCase {
    constructor(private options: { storageRepository: StorageRepository }) {}

    public execute(request: StorageUploadRequest): FutureData<void> {
        return this.options.storageRepository.uploadFile(request);
    }
}
