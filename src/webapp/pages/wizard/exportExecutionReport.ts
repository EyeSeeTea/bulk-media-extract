import type {
    ExportExecutionConfiguration,
    ExportExecutionConfigurationOperation,
} from "$/webapp/pages/wizard/exportExecutionConfiguration";

export const EXPORT_EXECUTION_REPORT_VERSION = "1";

export type ExportExecutionRunStatus =
    | "idle"
    | "running"
    | "success"
    | "partial-failure"
    | "failed"
    | "interrupted";

export type ExportExecutionReportResult = {
    operationIndex: number;
    source: ExportExecutionConfigurationOperation["source"];
    target: ExportExecutionConfigurationOperation["target"];
    status: "success" | "failure";
    completedAt: string;
    error?: string;
};

export type ExportExecutionReport = {
    version: string;
    startedAt: string;
    finishedAt?: string;
    status: ExportExecutionRunStatus;
    interrupted: boolean;
    configuration: ExportExecutionConfiguration;
    summary: {
        totalOperations: number;
        attemptedOperations: number;
        successCount: number;
        failureCount: number;
    };
    results: ExportExecutionReportResult[];
};

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

export function buildExecutionReportFilename(
    selectedProgramId: string,
    startedAt: string
): string {
    const normalizedTimestamp = startedAt.replace(/[.:]/g, "-");
    return `export-execution-report-${selectedProgramId}-${normalizedTimestamp}.json`;
}

export function downloadExecutionReport(
    report: ExportExecutionReport,
    filename = buildExecutionReportFilename(report.configuration.scope.program.id, report.startedAt)
): void {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
