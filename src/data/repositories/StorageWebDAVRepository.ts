import { FutureData } from "$/data/api-futures";
import { Future } from "$/domain/entities/generic/Future";
import { StorageConnectionConfig, StorageRepository } from "$/domain/repositories/StorageRepository";

const PROPFIND_BODY = `<?xml version="1.0" encoding="utf-8" ?>
<propfind xmlns="DAV:">
  <prop>
    <displayname />
  </prop>
</propfind>`;

export class StorageWebDAVRepository implements StorageRepository {
    public validateConnection(config: StorageConnectionConfig): FutureData<void> {
        const abortController = new AbortController();
        const url = config.url.trim();

        return Future.fromComputation((resolve, reject) => {
            fetch(url, {
                method: "PROPFIND",
                headers: {
                    Authorization: `Basic ${encodeBasicAuth(config.username, config.password)}`,
                    Depth: "0",
                    "Content-Type": "application/xml; charset=utf-8",
                },
                body: PROPFIND_BODY,
                signal: abortController.signal,
            })
                .then(async response => {
                    if (response.ok || response.status === 207) {
                        resolve(undefined);
                        return;
                    }

                    reject(new Error(await buildValidationError(response)));
                })
                .catch((error: unknown) => {
                    if (isAbortError(error)) {
                        throw Future.cancel();
                    }

                    reject(
                        error instanceof Error
                            ? error
                            : new Error(
                                  "Connection validation failed. Ensure the WebDAV URL is correct, credentials are valid, and the server allows cross-origin requests from this app."
                              )
                    );
                });

            return () => abortController.abort();
        });
    }
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
