import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { ProgramEventsPreviewResult } from "$/domain/entities/FileExportProgram";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { StepIntro } from "$/webapp/pages/wizard/components/StepIntro";
import {
    buildExportExecutionConfiguration,
    buildExportExecutionConfigurationFilename,
    downloadExportExecutionConfiguration,
    ExportExecutionConfigurationFileMapping,
} from "$/webapp/pages/wizard/exportExecutionConfiguration";
import {
    buildCaptureEventUrl,
    ExportPreviewRow,
    formatFileSize,
    getPreviewCellValue,
    getPreviewFileWarning,
} from "$/webapp/pages/wizard/previewUtils";
import { OrgUnitSelectionMode } from "$/webapp/pages/wizard/wizardConfig";
import i18n from "$/utils/i18n";

type PreviewStepProps = {
    selectedProgramName: string;
    selectedProgramId: string;
    selectedOrgUnitName: string;
    selectedOrgUnitId: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    selectedFileMappings: Array<{
        id: string;
        name: string;
        template: string;
    }>;
    exportConfigurationFileMappings: ExportExecutionConfigurationFileMapping[];
    dateFrom: string;
    dateTo: string;
    previewState: AsyncData<ProgramEventsPreviewResult>;
    previewRows: ExportPreviewRow[];
    previewSummary: {
        totalFiles: number;
        totalSize: number;
        duplicateTargetPaths: string[];
        missingFileResourceCount: number;
    };
    onRetry: () => void;
};

export const PreviewStep: React.FC<PreviewStepProps> = ({
    selectedProgramName,
    selectedProgramId,
    selectedOrgUnitName,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    selectedFileMappings,
    exportConfigurationFileMappings,
    dateFrom,
    dateTo,
    previewState,
    previewRows,
    previewSummary,
    onRetry,
}) => {
    const hasScope = Boolean(selectedProgramId && selectedOrgUnitId);
    const previewTotal =
        previewState.status === "success"
            ? String(previewState.data.total ?? previewRows.length)
            : "";
    const previewPages =
        previewState.status === "success" ? String(previewState.data.pageCount ?? 1) : "";
    const [exportConfigStatus, setExportConfigStatus] = React.useState<"idle" | "downloaded">(
        "idle"
    );

    const onExportConfiguration = React.useCallback(() => {
        const generatedAt = new Date().toISOString();
        const configuration = buildExportExecutionConfiguration({
            generatedAt,
            selectedProgramId,
            selectedProgramName,
            selectedOrgUnitId,
            selectedOrgUnitName,
            orgUnitSelectionMode,
            dateFrom,
            dateTo,
            selectedFileMappings: exportConfigurationFileMappings,
            previewRows,
        });

        downloadExportExecutionConfiguration(
            configuration,
            buildExportExecutionConfigurationFilename(selectedProgramId, generatedAt)
        );
        setExportConfigStatus("downloaded");
    }, [
        dateFrom,
        dateTo,
        exportConfigurationFileMappings,
        orgUnitSelectionMode,
        previewRows,
        selectedOrgUnitId,
        selectedOrgUnitName,
        selectedProgramId,
        selectedProgramName,
    ]);

    return (
        <div className="wizard-step-content" aria-label="wizard-step-preview">
            <StepIntro
                title={i18n.t("Review the resolved export plan")}
                description={i18n.t(
                    "Inspect the final target paths and warnings before you unlock the storage and execution steps."
                )}
            />
            {!hasScope ? (
                <NoticeBox title={i18n.t("Preview requirements")}>
                    {i18n.t("Select program and organisation unit filter before loading preview.")}
                </NoticeBox>
            ) : null}

            {hasScope && previewState.status === "loading" ? <CircularLoader small /> : null}
            {hasScope && previewState.status === "error" ? (
                <div>
                    <NoticeBox error title={i18n.t("Could not load event preview")}>
                        {previewState.error}
                    </NoticeBox>
                    <div className="actions-row">
                        <Button small onClick={onRetry}>
                            {i18n.t("Retry preview")}
                        </Button>
                    </div>
                </div>
            ) : null}
            {hasScope && previewState.status === "success" ? (
                <>
                    <div
                        className="wizard-section wizard-preview-summary"
                        data-testid="wizard-preview-summary"
                    >
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Program")}</span>
                            <strong>{selectedProgramName}</strong>
                        </div>
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Selected file data elements")}</span>
                            <ul
                                className="wizard-preview-mapping-list"
                                data-testid="wizard-preview-file-mappings"
                            >
                                {selectedFileMappings.map(fileMapping => (
                                    <li key={fileMapping.id}>
                                        <strong>{fileMapping.name}</strong>
                                        <code>{fileMapping.template}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Org unit")}</span>
                            <strong>{selectedOrgUnitName}</strong>
                        </div>
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Org unit mode")}</span>
                            <strong>
                                {orgUnitSelectionMode === "selected"
                                    ? i18n.t("Selected")
                                    : i18n.t("Descendants")}
                            </strong>
                        </div>
                    </div>
                    <p>{i18n.t("Preview the resolved export rows before continuing.")}</p>
                    {previewRows.length === 0 ? (
                        <NoticeBox title={i18n.t("No files found")}>
                            {dateFrom || dateTo
                                ? i18n.t("No exportable files match the selected date filters.")
                                : i18n.t("No exportable files match the current selection.")}
                        </NoticeBox>
                    ) : (
                        <div className="wizard-preview-table-wrap">
                            <table className="preview-table wizard-preview-table" data-testid="wizard-preview-table">
                                <thead>
                                    <tr>
                                        <th>{i18n.t("Event")}</th>
                                        <th>{i18n.t("File data value")}</th>
                                        <th>{i18n.t("Source filename")}</th>
                                        <th>{i18n.t("Size")}</th>
                                        <th>{i18n.t("Target")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map(row => {
                                        const warning = getPreviewFileWarning(row);

                                        return (
                                            <tr
                                                key={row.id}
                                                data-testid={`wizard-preview-row-${row.id}`}
                                                className={[
                                                    row.hasDuplicateTargetPath
                                                        ? "wizard-preview-row-duplicate"
                                                        : "",
                                                    row.isMissingFileResource
                                                        ? "wizard-preview-row-warning"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                            >
                                                <td>
                                                    <a
                                                        className="wizard-preview-event-link"
                                                        href={buildCaptureEventUrl(
                                                            row.eventId,
                                                            row.eventOrgUnitId
                                                        )}
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                    >
                                                        {row.eventId}
                                                    </a>
                                                </td>
                                                <td>
                                                    <div className="wizard-preview-cell-primary">
                                                        {row.fileDataValueName}
                                                    </div>
                                                    <div className="wizard-preview-cell-secondary">
                                                        {row.eventOrgUnitName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="wizard-preview-cell-primary">
                                                        {getPreviewCellValue(row.fileName)}
                                                    </div>
                                                    {warning ? (
                                                        <div className="wizard-preview-warning-text">
                                                            {warning}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td>{formatFileSize(row.fileSize)}</td>
                                                <td>{getPreviewCellValue(row.resolvedTargetPath)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="wizard-preview-footer" data-testid="wizard-preview-footer">
                        {previewSummary.duplicateTargetPaths.length > 0 ? (
                            <NoticeBox
                                warning
                                title={i18n.t("Duplicate target filepaths detected")}
                                dataTest="wizard-preview-duplicate-error"
                            >
                                {i18n.t(
                                    "Revise the template. {{count}} target filepath conflicts were found.",
                                    {
                                        count: String(previewSummary.duplicateTargetPaths.length),
                                    }
                                )}
                            </NoticeBox>
                        ) : null}
                        {previewSummary.missingFileResourceCount > 0 ? (
                            <NoticeBox warning title={i18n.t("Files will be skipped")}>
                                {i18n.t(
                                    "{{count}} files without FileResource won't be exported.",
                                    {
                                        count: String(previewSummary.missingFileResourceCount),
                                    }
                                )}
                            </NoticeBox>
                        ) : null}
                        <div className="wizard-preview-footer-meta">
                            <p className="wizard-preview-meta-text">
                                {i18n.t("Matching events: {{total}}. Pages: {{pages}}.", {
                                    total: previewTotal,
                                    pages: previewPages,
                                    nsSeparator: false,
                                })}
                            </p>
                            <div className="wizard-preview-stats" data-testid="wizard-preview-stats">
                                <div className="wizard-preview-stat">
                                    <span>{i18n.t("Files")}</span>
                                    <strong>{String(previewSummary.totalFiles)}</strong>
                                </div>
                                <div className="wizard-preview-stat">
                                    <span>{i18n.t("Total size")}</span>
                                    <strong>{formatFileSize(previewSummary.totalSize)}</strong>
                                </div>
                            </div>
                            <div className="actions-row wizard-preview-actions">
                                <Button
                                    secondary
                                    data-testid="wizard-export-config-button"
                                    onClick={onExportConfiguration}
                                >
                                    {i18n.t("Export configuration")}
                                </Button>
                            </div>
                            <p className="wizard-preview-meta-text">
                                {i18n.t(
                                    "Download a JSON execution configuration for the current reviewed preview."
                                )}
                            </p>
                            {exportConfigStatus === "downloaded" ? (
                                <NoticeBox title={i18n.t("Execution configuration downloaded")}>
                                    {i18n.t(
                                        "The JSON execution configuration for this preview was downloaded."
                                    )}
                                </NoticeBox>
                            ) : null}
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};
