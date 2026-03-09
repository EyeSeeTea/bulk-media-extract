import { FutureData } from "$/data/api-futures";

export type StorageConnectionConfig = {
    url: string;
    username: string;
    password: string;
};

export type StorageUploadRequest = {
    connection: StorageConnectionConfig;
    targetPath: string;
    file: Blob;
};

export interface StorageRepository {
    validateConnection(config: StorageConnectionConfig): FutureData<void>;
    uploadFile(request: StorageUploadRequest): FutureData<void>;
}
