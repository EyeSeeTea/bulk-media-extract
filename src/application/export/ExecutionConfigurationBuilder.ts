import {
    EXPORT_EXECUTION_CONFIGURATION_VERSION,
    ExportExecutionConfiguration,
    ExportExecutionConfigurationFileMapping,
    ExportExecutionConfigurationOperation,
} from "$/application/export/ExportExecution";
import { ExportPreviewRow } from "$/application/export/ExportPreview";
import type { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";

export type {
    ExportExecutionConfiguration,
    ExportExecutionConfigurationFileMapping,
    ExportExecutionConfigurationOperation,
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

function isExportablePreviewRow(
    row: ExportPreviewRow
): row is ExportPreviewRow & { fileResourceId: string; resolvedTargetPath: string } {
    return Boolean(row.fileResourceId && row.resolvedTargetPath && !row.isMissingFileResource);
}
