import { FutureData } from "$/data/api-futures";
import {
    StorageConnectionConfig,
    StorageUploadRequest,
} from "$/application/storage/StorageContracts";

export type { StorageConnectionConfig, StorageUploadRequest };

export interface StorageRepository {
    validateConnection(config: StorageConnectionConfig): FutureData<void>;
    uploadFile(request: StorageUploadRequest): FutureData<void>;
}
