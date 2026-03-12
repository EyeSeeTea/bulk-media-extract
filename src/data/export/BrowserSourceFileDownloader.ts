import { SourceFileDownloader } from "$/application/export/ports/SourceFileDownloader";

export class BrowserSourceFileDownloader implements SourceFileDownloader {
    public async download(url: string, signal: AbortSignal): Promise<Response> {
        const response = await fetch(url, {
            method: "GET",
            credentials: "include",
            signal,
        });

        if (!response.ok) {
            throw new Error(`Source download failed with status ${response.status}.`);
        }

        return response;
    }
}
