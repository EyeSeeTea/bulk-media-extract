import React from "react";
import { ExportExecutionConfiguration } from "$/application/export/ExportExecution";
import { ExecutionRunHandle, runExecutionPlan } from "$/application/export/ExecutionRunner";
import { CompositionRoot } from "$/CompositionRoot";
import { getExecutionStatusMessage, runFutureData } from "$/webapp/pages/wizard/executionSupport";
import {
    initialExecutionState,
    WizardExecutionState,
    WizardStorageConfig,
} from "$/webapp/pages/wizard/wizardConfig";

type UseWizardExecutionControllerParams = {
    compositionRoot: CompositionRoot;
    executionConfiguration: ExportExecutionConfiguration;
    storage: WizardStorageConfig;
    executionState: WizardExecutionState;
    setExecution: (
        state: WizardExecutionState | ((previous: WizardExecutionState) => WizardExecutionState)
    ) => void;
};

export function useWizardExecutionController({
    compositionRoot,
    executionConfiguration,
    storage,
    executionState,
    setExecution,
}: UseWizardExecutionControllerParams) {
    const executionRunRef = React.useRef<ExecutionRunHandle | null>(null);

    const onRunExecution = React.useCallback(async () => {
        executionRunRef.current?.cancel();
        setExecution({
            ...initialExecutionState,
            total: executionConfiguration.operations.length,
        });

        const handle = runExecutionPlan({
            configuration: executionConfiguration,
            downloadSourceFile: (url, signal) => compositionRoot.sourceFiles.download(url, signal),
            writeTargetFile: params => {
                if (storage.selectedMethod === "webdav") {
                    let uploadHandle: { promise: Promise<void>; cancel?: () => void } | undefined;

                    return {
                        promise: params.response.blob().then(file => {
                            uploadHandle = runFutureData(
                                compositionRoot.storage.webdav.uploadFile.execute({
                                    connection: {
                                        url: storage.webdav.url,
                                        username: storage.webdav.username,
                                        password: storage.webdav.password,
                                    },
                                    targetPath: params.targetPath,
                                    file,
                                })
                            );

                            return uploadHandle.promise;
                        }),
                        cancel: () => {
                            uploadHandle?.cancel?.();
                        },
                    };
                }

                const directoryHandle = storage.localDirectory.directoryHandle;
                if (!directoryHandle) {
                    return {
                        promise: Promise.reject(
                            new Error(
                                "Local directory export is not ready. Select and validate a directory."
                            )
                        ),
                    };
                }

                return {
                    promise: compositionRoot.storage.localDirectory.writeResponse({
                        rootDirectory: directoryHandle,
                        targetPath: params.targetPath,
                        response: params.response,
                        signal: params.signal,
                    }),
                };
            },
            onProgress: snapshot => {
                setExecution(previous => ({
                    ...previous,
                    status: "running",
                    progress: snapshot.percentage,
                    processed: snapshot.processed,
                    total: snapshot.total,
                    successCount: snapshot.successCount,
                    failureCount: snapshot.failureCount,
                    currentTargetPath: snapshot.currentTargetPath,
                    error: undefined,
                }));
            },
            onLog: entry => {
                setExecution(previous => ({
                    ...previous,
                    logEntries: [
                        ...previous.logEntries,
                        {
                            id: `${entry.timestamp}-${previous.logEntries.length + 1}`,
                            timestamp: entry.timestamp,
                            status: entry.status,
                            message: entry.message,
                            targetPath: entry.targetPath,
                        },
                    ],
                }));
            },
            onStateChange: (status, report) => {
                setExecution(previous => ({
                    ...previous,
                    status,
                    progress:
                        report?.summary.totalOperations && report.summary.totalOperations > 0
                            ? Math.round(
                                  (report.summary.attemptedOperations /
                                      report.summary.totalOperations) *
                                      100
                              )
                            : previous.progress,
                    processed: report?.summary.attemptedOperations ?? previous.processed,
                    total:
                        report?.summary.totalOperations ?? executionConfiguration.operations.length,
                    successCount: report?.summary.successCount ?? previous.successCount,
                    failureCount: report?.summary.failureCount ?? previous.failureCount,
                    report,
                    error: getExecutionStatusMessage(status, report),
                }));
            },
        });

        executionRunRef.current = handle;

        try {
            await handle.done;
        } finally {
            if (executionRunRef.current === handle) {
                executionRunRef.current = null;
            }
        }
    }, [
        compositionRoot.sourceFiles,
        compositionRoot.storage.localDirectory,
        compositionRoot.storage.webdav.uploadFile,
        executionConfiguration,
        setExecution,
        storage,
    ]);

    const onInterruptExecution = React.useCallback(() => {
        executionRunRef.current?.cancel();
    }, []);

    const onDownloadExecutionReport = React.useCallback(() => {
        if (executionState.report) {
            compositionRoot.reports.downloadExecution(executionState.report);
        }
    }, [compositionRoot.reports, executionState.report]);

    React.useEffect(() => {
        return () => {
            executionRunRef.current?.cancel();
        };
    }, []);

    return {
        onRunExecution,
        onInterruptExecution,
        onDownloadExecutionReport,
    };
}
