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
