import { ExportPreviewRow } from "$/webapp/pages/wizard/previewUtils";
import { OrgUnitSelectionMode } from "$/webapp/pages/wizard/wizardConfig";

export const EXPORT_EXECUTION_CONFIGURATION_VERSION = "1";

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

type BuildExportExecutionConfigurationParams = {
    generatedAt?: string;
    selectedProgramId: string;
    selectedProgramName: string;
    selectedOrgUnitId: string;
    selectedOrgUnitName: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    dateFrom: string;
    dateTo: string;
    selectedFileMappings: ExportExecutionConfigurationFileMapping[];
    previewRows: ExportPreviewRow[];
};

export function buildExportExecutionConfiguration(
    params: BuildExportExecutionConfigurationParams
): ExportExecutionConfiguration {
    const operations = params.previewRows
        .filter(isExportablePreviewRow)
        .map<ExportExecutionConfigurationOperation>(row => ({
            source: {
                url: row.fileDataValueUrl,
                fileResourceId: row.fileResourceId,
                fileSize: row.fileSize,
            },
            target: {
                path: row.resolvedTargetPath,
            },
        }));

    return {
        version: EXPORT_EXECUTION_CONFIGURATION_VERSION,
        generatedAt: params.generatedAt ?? new Date().toISOString(),
        scope: {
            program: {
                id: params.selectedProgramId,
                name: params.selectedProgramName,
            },
            orgUnit: {
                id: params.selectedOrgUnitId,
                name: params.selectedOrgUnitName,
                mode: params.orgUnitSelectionMode,
            },
            dateRange: {
                from: params.dateFrom || undefined,
                to: params.dateTo || undefined,
            },
            fileMappings: params.selectedFileMappings.map(fileMapping => ({
                id: fileMapping.id,
                name: fileMapping.name,
                template: fileMapping.template,
                programStageId: fileMapping.programStageId,
                programStageName: fileMapping.programStageName,
            })),
        },
        summary: {
            totalPreviewRows: params.previewRows.length,
            exportableOperations: operations.length,
            skippedMissingFileResource: params.previewRows.filter(row => row.isMissingFileResource)
                .length,
        },
        operations,
    };
}

export function buildExportExecutionConfigurationFilename(
    selectedProgramId: string,
    generatedAt: string
): string {
    const normalizedTimestamp = generatedAt.replace(/[.:]/g, "-");
    return `export-execution-configuration-${selectedProgramId}-${normalizedTimestamp}.json`;
}

export function downloadExportExecutionConfiguration(
    configuration: ExportExecutionConfiguration,
    filename = buildExportExecutionConfigurationFilename(
        configuration.scope.program.id,
        configuration.generatedAt
    )
): void {
    const json = JSON.stringify(configuration, null, 2);
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

function isExportablePreviewRow(
    row: ExportPreviewRow
): row is ExportPreviewRow & { fileResourceId: string; resolvedTargetPath: string } {
    return Boolean(row.fileResourceId && row.resolvedTargetPath && !row.isMissingFileResource);
}
