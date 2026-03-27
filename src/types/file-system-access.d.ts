type FileSystemPermissionMode = "read" | "readwrite";
type FileSystemPermissionState = "granted" | "denied" | "prompt";

interface FileSystemHandlePermissionDescriptor {
    mode?: FileSystemPermissionMode;
}

interface FileSystemHandle {
    kind: "file" | "directory";
    name: string;
    queryPermission?(
        descriptor?: FileSystemHandlePermissionDescriptor
    ): Promise<FileSystemPermissionState>;
    requestPermission?(
        descriptor?: FileSystemHandlePermissionDescriptor
    ): Promise<FileSystemPermissionState>;
}

interface FileSystemCreateWritableOptions {
    keepExistingData?: boolean;
}

interface FileSystemGetDirectoryOptions {
    create?: boolean;
}

interface FileSystemGetFileOptions {
    create?: boolean;
}

interface FileSystemFileHandle extends FileSystemHandle {
    kind: "file";
    createWritable(
        options?: FileSystemCreateWritableOptions
    ): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: "directory";
    getDirectoryHandle(
        name: string,
        options?: FileSystemGetDirectoryOptions
    ): Promise<FileSystemDirectoryHandle>;
    getFileHandle(name: string, options?: FileSystemGetFileOptions): Promise<FileSystemFileHandle>;
}

interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
}
