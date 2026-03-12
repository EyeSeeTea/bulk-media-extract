import type { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";

export const EXPORT_EXECUTION_CONFIGURATION_VERSION = "1";
export const EXPORT_EXECUTION_REPORT_VERSION = "1";

export type ExportExecutionConfigurationFileMapping = {
    id: string;
    name: string;
    template: string;
    programStageId?: string;
    programStageName?: string;
};

export type ExportExecutionConfigurationOperation = {
    source: {
        url: string;
        fileResourceId: string;
        fileSize?: number;
    };
    target: {
        path: string;
    };
};

export type ExportExecutionConfiguration = {
    version: string;
    generatedAt: string;
    scope: {
        program: {
            id: string;
            name: string;
        };
        orgUnit: {
            id: string;
            name: string;
            mode: OrgUnitSelectionMode;
        };
        dateRange: {
            from?: string;
            to?: string;
        };
        fileMappings: ExportExecutionConfigurationFileMapping[];
    };
    summary: {
        totalPreviewRows: number;
        exportableOperations: number;
        skippedMissingFileResource: number;
    };
    operations: ExportExecutionConfigurationOperation[];
};

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

export function buildExecutionReportFilename(selectedProgramId: string, startedAt: string): string {
    const normalizedTimestamp = startedAt.replace(/[.:]/g, "-");
    return `export-execution-report-${selectedProgramId}-${normalizedTimestamp}.json`;
}
