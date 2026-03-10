const READWRITE_PERMISSION = { mode: "readwrite" as const };

export function supportsLocalDirectoryStorage(): boolean {
    return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

export async function selectLocalDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!supportsLocalDirectoryStorage()) {
        throw new Error(
            "Local directory export is not supported in this browser. Use a Chromium-based browser or switch to WebDAV."
        );
    }

    const showDirectoryPicker = window.showDirectoryPicker;
    if (!showDirectoryPicker) {
        throw new Error(
            "Local directory export is not supported in this browser. Use a Chromium-based browser or switch to WebDAV."
        );
    }

    try {
        return await showDirectoryPicker();
    } catch (error: unknown) {
        throw new Error(
            error instanceof Error && error.name === "AbortError"
                ? "Directory selection was cancelled."
                : "Could not open the local directory picker."
        );
    }
}

export async function validateLocalDirectoryAccess(
    handle?: FileSystemDirectoryHandle
): Promise<void> {
    if (!supportsLocalDirectoryStorage()) {
        throw new Error(
            "Local directory export is not supported in this browser. Use a Chromium-based browser or switch to WebDAV."
        );
    }

    if (!handle) {
        throw new Error("Select a local directory before validating.");
    }

    const queryPermission = handle.queryPermission?.bind(handle);
    const requestPermission = handle.requestPermission?.bind(handle);

    const currentPermission = queryPermission
        ? await queryPermission(READWRITE_PERMISSION)
        : "prompt";

    if (currentPermission === "granted") {
        return;
    }

    const requestedPermission = requestPermission
        ? await requestPermission(READWRITE_PERMISSION)
        : currentPermission;

    if (requestedPermission !== "granted") {
        throw new Error(
            "Local directory validation failed. The browser did not grant write access to the selected directory."
        );
    }
}

export async function writeResponseToLocalDirectory(params: {
    rootDirectory: FileSystemDirectoryHandle;
    targetPath: string;
    response: Response;
    signal: AbortSignal;
}): Promise<void> {
    const relativePath = normalizeTargetPath(params.targetPath);
    const pathSegments = relativePath.split("/").filter(Boolean);
    const fileName = pathSegments[pathSegments.length - 1];

    if (!fileName) {
        throw new Error(`Target path "${params.targetPath}" does not resolve to a file name.`);
    }

    let directoryHandle = params.rootDirectory;
    for (const segment of pathSegments.slice(0, -1)) {
        directoryHandle = await directoryHandle.getDirectoryHandle(segment, { create: true });
    }

    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();

    try {
        if (params.response.body) {
            const reader = params.response.body.getReader();
            let done = false;

            while (!done) {
                if (params.signal.aborted) {
                    throw new DOMException("The operation was aborted.", "AbortError");
                }

                const readResult = await reader.read();
                done = readResult.done;
                if (done) {
                    break;
                }

                if (!readResult.value) {
                    continue;
                }

                await writable.write(readResult.value);
            }

            await writable.close();
            return;
        }

        const blob = await params.response.blob();
        await writable.write(blob);
        await writable.close();
    } catch (error) {
        await writable.abort?.();
        throw error;
    }
}

function normalizeTargetPath(targetPath: string): string {
    return targetPath.replace(/^\/+/, "").replace(/\/+/g, "/");
}
