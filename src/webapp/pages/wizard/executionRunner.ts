import { StorageConnectionConfig } from "$/domain/repositories/StorageRepository";
import { ExportExecutionConfiguration } from "$/webapp/pages/wizard/exportExecutionConfiguration";
import {
    buildExecutionReport,
    ExportExecutionReport,
    ExportExecutionReportResult,
    ExportExecutionRunStatus,
} from "$/webapp/pages/wizard/exportExecutionReport";

type ProgressSnapshot = {
    processed: number;
    total: number;
    successCount: number;
    failureCount: number;
    percentage: number;
    currentTargetPath?: string;
};

type RunExecutionParams = {
    configuration: ExportExecutionConfiguration;
    storage: StorageConnectionConfig;
    downloadSourceFile: (url: string, signal: AbortSignal) => Promise<Blob>;
    uploadToStorage: (params: {
        connection: StorageConnectionConfig;
        targetPath: string;
        file: Blob;
    }) => { promise: Promise<void>; cancel?: () => void };
    onProgress: (snapshot: ProgressSnapshot) => void;
    onStateChange: (status: ExportExecutionRunStatus, report?: ExportExecutionReport) => void;
};

export type ExecutionRunHandle = {
    cancel: () => void;
    done: Promise<ExportExecutionReport>;
};

export function runExecutionPlan(params: RunExecutionParams): ExecutionRunHandle {
    const abortController = new AbortController();
    let currentUploadCancel: (() => void) | undefined;
    let interrupted = false;

    const done = (async () => {
        const results: ExportExecutionReportResult[] = [];
        const startedAt = new Date().toISOString();
        const total = params.configuration.operations.length;

        params.onStateChange("running");
        params.onProgress({
            processed: 0,
            total,
            successCount: 0,
            failureCount: 0,
            percentage: total === 0 ? 100 : 0,
        });

        for (const [index, operation] of params.configuration.operations.entries()) {
            if (abortController.signal.aborted) {
                interrupted = true;
                break;
            }

            try {
                const file = await params.downloadSourceFile(operation.source.url, abortController.signal);
                const upload = params.uploadToStorage({
                    connection: params.storage,
                    targetPath: operation.target.path,
                    file,
                });

                currentUploadCancel = upload.cancel;
                await upload.promise;
                currentUploadCancel = undefined;

                results.push({
                    operationIndex: index,
                    source: operation.source,
                    target: operation.target,
                    status: "success",
                    completedAt: new Date().toISOString(),
                });
            } catch (error: unknown) {
                currentUploadCancel = undefined;
                if (abortController.signal.aborted) {
                    interrupted = true;
                    break;
                }

                results.push({
                    operationIndex: index,
                    source: operation.source,
                    target: operation.target,
                    status: "failure",
                    completedAt: new Date().toISOString(),
                    error: error instanceof Error ? error.message : "Unknown execution error",
                });
            }

            const successCount = results.filter(result => result.status === "success").length;
            const failureCount = results.filter(result => result.status === "failure").length;
            params.onProgress({
                processed: results.length,
                total,
                successCount,
                failureCount,
                percentage: total === 0 ? 100 : Math.round((results.length / total) * 100),
                currentTargetPath: operation.target.path,
            });
        }

        const finishedAt = new Date().toISOString();
        const finalStatus = resolveFinalStatus({
            interrupted,
            total,
            results,
        });
        const report = buildExecutionReport({
            configuration: params.configuration,
            startedAt,
            finishedAt,
            status: finalStatus,
            interrupted,
            results,
        });

        params.onStateChange(finalStatus, report);
        return report;
    })();

    return {
        cancel: () => {
            abortController.abort();
            currentUploadCancel?.();
        },
        done,
    };
}

function resolveFinalStatus(params: {
    interrupted: boolean;
    total: number;
    results: ExportExecutionReportResult[];
}): ExportExecutionRunStatus {
    if (params.interrupted) {
        return "interrupted";
    }

    const successCount = params.results.filter(result => result.status === "success").length;
    const failureCount = params.results.filter(result => result.status === "failure").length;

    if (params.total === 0) {
        return "success";
    }

    if (failureCount === 0 && successCount === params.total) {
        return "success";
    }

    if (successCount === 0 && failureCount > 0) {
        return "failed";
    }

    return "partial-failure";
}
