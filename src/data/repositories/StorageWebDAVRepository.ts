import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import {
    StorageConnectionConfig,
    StorageRepository,
    StorageUploadRequest,
} from "$/domain/repositories/StorageRepository";

const PROPFIND_BODY = `<?xml version="1.0" encoding="utf-8" ?>
<propfind xmlns="DAV:">
  <prop>
    <displayname />
  </prop>
</propfind>`;

export class StorageWebDAVRepository implements StorageRepository {
    public validateConnection(config: StorageConnectionConfig): FutureData<void> {
        return this.request({
            url: config.url.trim(),
            config,
            method: "PROPFIND",
            headers: {
                Depth: "0",
                "Content-Type": "application/xml; charset=utf-8",
            },
            body: PROPFIND_BODY,
            acceptedStatuses: [200, 204, 207],
            buildErrorMessage: buildValidationError,
        });
    }

    public uploadFile(request: StorageUploadRequest): FutureData<void> {
        const normalizedPath = normalizeTargetPath(request.targetPath);
        const directoryPaths = buildDirectoryPaths(normalizedPath);
        const ensureDirectories = Future.sequential(
            directoryPaths.map(directoryPath =>
                this.request({
                    url: buildStorageUrl(request.connection.url, directoryPath),
                    config: request.connection,
                    method: "MKCOL",
                    acceptedStatuses: [201, 204, 301, 302, 405],
                    buildErrorMessage: response =>
                        buildUploadError(response, `Could not create directory "${directoryPath}"`),
                })
            )
        );

        return ensureDirectories.flatMap(() =>
            this.request({
                url: buildStorageUrl(request.connection.url, normalizedPath),
                config: request.connection,
                method: "PUT",
                headers: {
                    "Content-Type": request.file.type || "application/octet-stream",
                },
                body: request.file,
                acceptedStatuses: [200, 201, 204],
                buildErrorMessage: response =>
                    buildUploadError(response, `Upload failed for "${request.targetPath}"`),
            })
        );
    }

    private request(params: {
        url: string;
        config: StorageConnectionConfig;
        method: "PROPFIND" | "MKCOL" | "PUT";
        headers?: Record<string, string>;
        body?: BodyInit;
        acceptedStatuses: number[];
        buildErrorMessage: (response: Response) => Promise<string>;
    }): FutureData<void> {
        const abortController = new AbortController();
        const headers = {
            Authorization: `Basic ${encodeBasicAuth(params.config.username, params.config.password)}`,
            ...params.headers,
        };

        return Future.fromComputation((resolve, reject) => {
            fetch(params.url, {
                method: params.method,
                headers,
                body: params.body,
                signal: abortController.signal,
            })
                .then(async response => {
                    if (params.acceptedStatuses.includes(response.status) || response.ok) {
                        resolve(undefined);
                        return;
                    }

                    reject(new Error(await params.buildErrorMessage(response)));
                })
                .catch((error: unknown) => {
                    if (isAbortError(error)) {
                        throw Future.cancel();
                    }

                    reject(
                        error instanceof Error
                            ? error
                            : new Error(
                                  "Storage request failed. Ensure the WebDAV URL is correct, credentials are valid, and the server allows cross-origin requests from this app."
                              )
                    );
                });
            return () => abortController.abort();
        });
    }
}

function buildStorageUrl(baseUrl: string, targetPath: string): string {
    const normalizedBaseUrl = baseUrl.trim().replace(/\/+$/, "");
    const normalizedTargetPath = normalizeTargetPath(targetPath);

    if (!normalizedTargetPath) {
        return normalizedBaseUrl;
    }

    return `${normalizedBaseUrl}/${normalizedTargetPath
        .split("/")
        .map(segment => encodeURIComponent(segment))
        .join("/")}`;
}

function normalizeTargetPath(targetPath: string): string {
    return targetPath.replace(/^\/+/, "").replace(/\/+/g, "/");
}

function buildDirectoryPaths(targetPath: string): string[] {
    const segments = normalizeTargetPath(targetPath).split("/").filter(Boolean);
    const directorySegments = segments.slice(0, -1);

    return directorySegments.map((_, index) => directorySegments.slice(0, index + 1).join("/"));
}

function encodeBasicAuth(username: string, password: string): string {
    if (typeof btoa !== "function") {
        throw new Error("Connection validation failed. Browser base64 encoding is unavailable.");
    }

    return btoa(`${username}:${password}`);
}

async function buildValidationError(response: Response): Promise<string> {
    if (response.status === 401 || response.status === 403) {
        return "Connection validation failed. The WebDAV server rejected the provided credentials.";
    }

    if (response.status === 404) {
        return "Connection validation failed. The WebDAV endpoint was not found. Check that the URL points to the direct WebDAV path.";
    }

    if (response.status >= 500) {
        return "Connection validation failed. The WebDAV server returned an unexpected server error.";
    }

    const body = await safeReadBody(response);
    return body
        ? `Connection validation failed. The WebDAV server responded with status ${response.status}: ${body}`
        : `Connection validation failed. The WebDAV server responded with status ${response.status}.`;
}

async function buildUploadError(response: Response, prefix: string): Promise<string> {
    const body = await safeReadBody(response);
    return body
        ? `${prefix}. The WebDAV server responded with status ${response.status}: ${body}`
        : `${prefix}. The WebDAV server responded with status ${response.status}.`;
}

async function safeReadBody(response: Response): Promise<string> {
    try {
        const text = await response.text();
        return text.trim().slice(0, 200);
    } catch {
        return "";
    }
}

function isAbortError(error: unknown): error is { name: string } {
    return Boolean(error && typeof error === "object" && "name" in error && error.name === "AbortError");
}
