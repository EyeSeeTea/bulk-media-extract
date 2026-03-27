import { ExportExecutionConfiguration } from "$/application/export/ExportExecution";
import { buildExecutionReport } from "$/application/export/ExecutionReportBuilder";
import {
    ExportExecutionReport,
    ExportExecutionReportResult,
    ExportExecutionRunStatus,
} from "$/application/export/ExportExecution";

type ProgressSnapshot = {
    processed: number;
    total: number;
    successCount: number;
    failureCount: number;
    percentage: number;
    currentTargetPath?: string;
};

export type ExecutionLogSnapshot = {
    timestamp: string;
    status: "info" | "success" | "failure" | "warning";
    message: string;
    targetPath?: string;
};

type RunExecutionParams = {
    configuration: ExportExecutionConfiguration;
    downloadSourceFile: (url: string, signal: AbortSignal) => Promise<Response>;
    writeTargetFile: (params: { targetPath: string; response: Response; signal: AbortSignal }) => {
        promise: Promise<void>;
        cancel?: () => void;
    };
    onProgress: (snapshot: ProgressSnapshot) => void;
    onLog: (entry: ExecutionLogSnapshot) => void;
    onStateChange: (status: ExportExecutionRunStatus, report?: ExportExecutionReport) => void;
};

export type ExecutionRunHandle = {
    cancel: () => void;
    done: Promise<ExportExecutionReport>;
};

export function runExecutionPlan(params: RunExecutionParams): ExecutionRunHandle {
    const abortController = new AbortController();
    let currentWriteCancel: (() => void) | undefined;
    let interrupted = false;

    const done = (async () => {
        const results: ExportExecutionReportResult[] = [];
        const startedAt = new Date().toISOString();
        const total = params.configuration.operations.length;

        params.onStateChange("running");
        params.onLog({
            timestamp: startedAt,
            status: "info",
            message:
                total === 0
                    ? "Export started with no operations to process."
                    : `Export started with ${total} file${total === 1 ? "" : "s"} to process.`,
        });
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
                const response = await params.downloadSourceFile(
                    operation.source.url,
                    abortController.signal
                );
                const writeTarget = params.writeTargetFile({
                    targetPath: operation.target.path,
                    response,
                    signal: abortController.signal,
                });

                currentWriteCancel = writeTarget.cancel;
                await writeTarget.promise;
                currentWriteCancel = undefined;

                results.push({
                    operationIndex: index,
                    source: operation.source,
                    target: operation.target,
                    status: "success",
                    completedAt: new Date().toISOString(),
                });
                params.onLog({
                    timestamp: results[results.length - 1]?.completedAt ?? new Date().toISOString(),
                    status: "success",
                    message: "File synced successfully.",
                    targetPath: operation.target.path,
                });
            } catch (error: unknown) {
                currentWriteCancel = undefined;
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
                params.onLog({
                    timestamp: results[results.length - 1]?.completedAt ?? new Date().toISOString(),
                    status: "failure",
                    message: error instanceof Error ? error.message : "Unknown execution error",
                    targetPath: operation.target.path,
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
        params.onLog({
            timestamp: finishedAt,
            status:
                finalStatus === "interrupted"
                    ? "warning"
                    : finalStatus === "success"
                    ? "success"
                    : "failure",
            message: getFinalLogMessage(finalStatus, results.length, total),
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
            currentWriteCancel?.();
        },
        done,
    };
}

function getFinalLogMessage(
    status: ExportExecutionRunStatus,
    attemptedOperations: number,
    totalOperations: number
): string {
    if (status === "interrupted") {
        return `Export interrupted after ${attemptedOperations} of ${totalOperations} file${
            totalOperations === 1 ? "" : "s"
        }.`;
    }

    if (status === "success") {
        return `Export completed successfully for ${attemptedOperations} file${
            attemptedOperations === 1 ? "" : "s"
        }.`;
    }

    if (status === "failed") {
        return "Export failed for all attempted transfers.";
    }

    if (status === "partial-failure") {
        return "Export completed with some failed transfers.";
    }

    return "Export status updated.";
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
