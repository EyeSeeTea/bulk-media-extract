import {
    EXPORT_EXECUTION_REPORT_VERSION,
    ExportExecutionConfiguration,
    ExportExecutionReport,
    ExportExecutionReportResult,
    ExportExecutionRunStatus,
} from "$/application/export/ExportExecution";

export function buildExecutionReport(params: {
    configuration: ExportExecutionConfiguration;
    startedAt: string;
    finishedAt?: string;
    status: ExportExecutionRunStatus;
    interrupted: boolean;
    results: ExportExecutionReportResult[];
}): ExportExecutionReport {
    const successCount = params.results.filter(result => result.status === "success").length;
    const failureCount = params.results.filter(result => result.status === "failure").length;

    return {
        version: EXPORT_EXECUTION_REPORT_VERSION,
        startedAt: params.startedAt,
        finishedAt: params.finishedAt,
        status: params.status,
        interrupted: params.interrupted,
        configuration: params.configuration,
        summary: {
            totalOperations: params.configuration.operations.length,
            attemptedOperations: params.results.length,
            successCount,
            failureCount,
        },
        results: params.results,
    };
}
