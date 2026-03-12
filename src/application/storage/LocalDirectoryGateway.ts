export interface LocalDirectoryGateway {
    supportsDirectorySelection(): boolean;
    selectDirectory(): Promise<FileSystemDirectoryHandle>;
    validateDirectoryAccess(handle?: FileSystemDirectoryHandle): Promise<void>;
    writeResponse(params: {
        rootDirectory: FileSystemDirectoryHandle;
        targetPath: string;
        response: Response;
        signal: AbortSignal;
    }): Promise<void>;
}
