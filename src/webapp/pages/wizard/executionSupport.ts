import { FutureData } from "$/data/api-futures";
import { ExportExecutionReport } from "$/application/export/ExportExecution";
import { WizardExecutionLogEntry, WizardExecutionState } from "$/webapp/pages/wizard/wizardConfig";
import i18n from "$/utils/i18n";

export function runFutureData<Data>(future: FutureData<Data>): {
    promise: Promise<Data>;
    cancel?: () => void;
} {
    let futureCancel: (() => void) | undefined;
    let rejectPromise: ((error: Error) => void) | undefined;
    let settled = false;
    const promise = new Promise<Data>((resolve, reject) => {
        rejectPromise = reject;
        futureCancel = future.run(
            data => {
                settled = true;
                resolve(data);
            },
            error => {
                settled = true;
                reject(error);
            }
        );
    });

    return {
        promise,
        cancel: () => {
            futureCancel?.();

            if (!settled) {
                settled = true;
                rejectPromise?.(new Error("Execution interrupted by user."));
            }
        },
    };
}

export function getExecutionStatusMessage(
    status: WizardExecutionState["status"],
    report?: ExportExecutionReport
): string | undefined {
    if (!report) {
        return undefined;
    }

    if (status === "success") {
        return "All files processed successfully.";
    }

    if (status === "partial-failure") {
        return `Execution finished with ${report.summary.failureCount} failed transfers.`;
    }

    if (status === "failed") {
        return "Execution failed for all attempted transfers.";
    }

    if (status === "interrupted") {
        return "Execution was interrupted before all transfers completed.";
    }

    return undefined;
}

export function getExecutionLogEntryLabel(entry: WizardExecutionLogEntry): string {
    if (entry.status === "success") {
        return i18n.t("Success");
    }

    if (entry.status === "failure") {
        return i18n.t("Failure");
    }

    if (entry.status === "warning") {
        return i18n.t("Warning");
    }

    return i18n.t("Info");
}

export function formatExecutionLogTimestamp(timestamp: string): string {
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) {
        return timestamp;
    }

    return parsed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}
