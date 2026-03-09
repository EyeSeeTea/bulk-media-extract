import { Future } from "$/domain/entities/generic/Future";
import {
    StorageConnectionConfig,
    StorageRepository,
    StorageUploadRequest,
} from "$/domain/repositories/StorageRepository";
import { FutureData } from "$/data/api-futures";

export class StorageTestRepository implements StorageRepository {
    public validateConnection(config: StorageConnectionConfig): FutureData<void> {
        const { url, username, password } = config;
        const hasAllValues = Boolean(url && username && password);
        const hasValidProtocol = /^https?:\/\//.test(url);
        const shouldFail = url.includes("fail") || username === "bad" || password === "bad";

        if (!hasAllValues || !hasValidProtocol || shouldFail) {
            return Future.error(
                new Error(
                    "Connection validation failed. Ensure the WebDAV URL is correct, credentials are valid, and the server allows cross-origin requests from this app."
                )
            );
        }

        return Future.success(undefined);
    }

    public uploadFile(request: StorageUploadRequest): FutureData<void> {
        const { connection, targetPath } = request;
        const shouldFail =
            connection.url.includes("fail") ||
            targetPath.includes("fail") ||
            connection.username === "bad" ||
            connection.password === "bad";

        if (shouldFail) {
            return Future.error(new Error(`Upload failed for ${targetPath}`));
        }

        return Future.success(undefined);
    }
}
