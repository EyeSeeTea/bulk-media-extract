import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { StepIntro } from "$/webapp/components/wizard/StepIntro";
import {
    formatExecutionLogTimestamp,
    getExecutionLogEntryLabel,
} from "$/webapp/pages/wizard/executionSupport";
import { WizardExecutionState } from "$/webapp/pages/wizard/wizardConfig";
import i18n from "$/utils/i18n";

type ExecutionStepProps = {
    executionState: WizardExecutionState;
    onRun: () => void;
    onRetry: () => void;
    onInterrupt: () => void;
    onDownloadReport: () => void;
};

export const ExecutionStep: React.FC<ExecutionStepProps> = ({
    executionState,
    onRun,
    onRetry,
    onInterrupt,
    onDownloadReport,
}) => {
    const hasReport = Boolean(executionState.report);
    const hasStartedExecution =
        executionState.status !== "idle" || executionState.logEntries.length > 0;
    const latestLogEntry = executionState.logEntries[executionState.logEntries.length - 1];
    const latestTargetPath = executionState.currentTargetPath ?? latestLogEntry?.targetPath ?? "";
    const progressWidth = `${Math.max(0, Math.min(executionState.progress, 100))}%`;

    return (
        <div className="wizard-step-content" aria-label="wizard-step-execution">
            <StepIntro
                title={i18n.t("Run the export")}
                description={i18n.t("Transfer the reviewed files to the configured destination.")}
            />
            <div
                className="wizard-execution-status-panel"
                data-testid="wizard-execution-status-panel"
            >
                <div className="wizard-execution-stat-groups" data-testid="wizard-execution-stats">
                    <div
                        className="wizard-execution-stat-pair"
                        data-testid="wizard-execution-stat-pair-throughput"
                    >
                        <div className="wizard-preview-stat wizard-execution-stat">
                            <span>{i18n.t("Processed")}</span>
                            <strong>{`${executionState.processed}/${executionState.total}`}</strong>
                        </div>
                        <div className="wizard-preview-stat wizard-execution-stat">
                            <span>{i18n.t("Progress")}</span>
                            <strong>{`${executionState.progress}%`}</strong>
                        </div>
                    </div>
                    <div
                        className="wizard-execution-stat-pair"
                        data-testid="wizard-execution-stat-pair-outcome"
                    >
                        <div className="wizard-preview-stat wizard-execution-stat">
                            <span>{i18n.t("Successes")}</span>
                            <strong>{String(executionState.successCount)}</strong>
                        </div>
                        <div className="wizard-preview-stat wizard-execution-stat">
                            <span>{i18n.t("Failures")}</span>
                            <strong>{String(executionState.failureCount)}</strong>
                        </div>
                    </div>
                </div>

                <div className="actions-row wizard-execution-actions">
                    {executionState.status !== "running" ? (
                        <Button
                            primary
                            onClick={
                                executionState.status === "failed" ||
                                executionState.status === "partial-failure" ||
                                executionState.status === "interrupted"
                                    ? onRetry
                                    : onRun
                            }
                        >
                            {executionState.status === "failed" ||
                            executionState.status === "partial-failure" ||
                            executionState.status === "interrupted"
                                ? i18n.t("Retry export")
                                : i18n.t("Start export")}
                        </Button>
                    ) : (
                        <Button secondary onClick={onInterrupt}>
                            {i18n.t("Interrupt export")}
                        </Button>
                    )}

                    {hasReport && executionState.status !== "success" ? (
                        <Button onClick={onDownloadReport}>
                            {i18n.t("Download result summary")}
                        </Button>
                    ) : null}
                </div>

                {hasStartedExecution ? (
                    <div
                        className={`wizard-execution-progress-panel ${
                            executionState.status === "running" ? "is-running" : ""
                        }`}
                        data-testid="wizard-execution-progress-panel"
                    >
                        <div className="wizard-execution-progress-header">
                            <div className="wizard-execution-progress-copy">
                                <p className="wizard-execution-progress-title">
                                    {executionState.status === "running"
                                        ? i18n.t("Export in progress")
                                        : i18n.t("Latest execution progress")}
                                </p>
                                <p className="wizard-execution-progress-description">
                                    {i18n.t(
                                        "Processed {{processed}} of {{total}} files ({{progress}}%).",
                                        {
                                            processed: String(executionState.processed),
                                            total: String(executionState.total),
                                            progress: String(executionState.progress),
                                        }
                                    )}
                                </p>
                            </div>
                            {executionState.status === "running" ? <CircularLoader small /> : null}
                        </div>
                        <div
                            className="wizard-execution-progress-track"
                            data-testid="wizard-execution-progress-bar"
                            aria-label={i18n.t("Execution progress")}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={executionState.progress}
                            role="progressbar"
                        >
                            <div
                                className={`wizard-execution-progress-fill ${
                                    executionState.status === "running" ? "is-running" : ""
                                }`}
                                style={{ width: progressWidth }}
                            />
                        </div>
                        {executionState.status !== "success" && latestTargetPath ? (
                            <p className="wizard-helper-text">
                                {i18n.t("Latest target path") + ":"} {latestTargetPath}
                            </p>
                        ) : null}
                    </div>
                ) : null}

                {hasStartedExecution ? (
                    <details className="wizard-execution-log" data-testid="wizard-execution-log">
                        <summary
                            className="wizard-execution-log-summary"
                            data-testid="wizard-execution-log-toggle"
                        >
                            <span>{i18n.t("Execution log")}</span>
                            <span className="wizard-execution-log-meta">
                                {i18n.t("{{count}} entries", {
                                    count: String(executionState.logEntries.length),
                                })}
                            </span>
                        </summary>
                        <div
                            className="wizard-execution-log-list"
                            data-testid="wizard-execution-log-list"
                        >
                            {executionState.logEntries.map(entry => (
                                <div
                                    key={entry.id}
                                    className={`wizard-execution-log-entry is-${entry.status}`}
                                >
                                    <div className="wizard-execution-log-entry-meta">
                                        <span className="wizard-execution-log-entry-label">
                                            {getExecutionLogEntryLabel(entry)}
                                        </span>
                                        <span>{formatExecutionLogTimestamp(entry.timestamp)}</span>
                                    </div>
                                    <p className="wizard-execution-log-entry-message">
                                        {entry.message}
                                    </p>
                                    {entry.targetPath ? (
                                        <code className="wizard-execution-log-entry-path">
                                            {entry.targetPath}
                                        </code>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </details>
                ) : null}
            </div>

            {executionState.status === "success" ? (
                <NoticeBox valid title={i18n.t("Export completed")}>
                    <div className="wizard-execution-success-notice">
                        <p className="wizard-execution-success-copy">
                            {i18n.t("All files processed successfully.")}
                        </p>
                        {hasReport ? (
                            <Button small onClick={onDownloadReport}>
                                {i18n.t("Download result summary")}
                            </Button>
                        ) : null}
                    </div>
                </NoticeBox>
            ) : null}

            {executionState.status === "partial-failure" ? (
                <NoticeBox warning title={i18n.t("Export completed with failures")}>
                    {executionState.error}
                </NoticeBox>
            ) : null}

            {executionState.status === "failed" ? (
                <NoticeBox error title={i18n.t("Export failed")}>
                    {executionState.error}
                </NoticeBox>
            ) : null}

            {executionState.status === "interrupted" ? (
                <NoticeBox warning title={i18n.t("Export interrupted")}>
                    {executionState.error}
                </NoticeBox>
            ) : null}
        </div>
    );
};
