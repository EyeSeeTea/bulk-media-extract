export interface SourceFileDownloader {
    download(url: string, signal: AbortSignal): Promise<Response>;
}
