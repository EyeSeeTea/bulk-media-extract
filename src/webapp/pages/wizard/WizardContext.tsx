import React from "react";
import { StorageConnectionConfig } from "$/application/storage/StorageContracts";
import {
    getStepValidationError,
    initialExecutionState,
    initialWizardState,
    validateTemplate,
    StorageMethod,
    WizardStepDefinition,
    WizardWebDAVStorageConfig,
    WizardState,
    WIZARD_STEPS,
} from "$/webapp/pages/wizard/wizardConfig";

type WizardContextValue = {
    state: WizardState;
    currentStepId: (typeof WIZARD_STEPS)[number]["id"];
    currentStepTitle: string;
    currentStepError?: string;
    setScope: (
        values: Partial<
            Pick<
                WizardState,
                | "selectedProgramId"
                | "selectedOrgUnitId"
                | "orgUnitSelectionMode"
                | "dateFrom"
                | "dateTo"
                | "selectedOrgUnitName"
            >
        >
    ) => void;
    setStorageMethod: (method: StorageMethod) => void;
    setWebDAVStorage: (values: Partial<WizardWebDAVStorageConfig>) => void;
    validateWebDAVConnection: () => Promise<void>;
    chooseLocalDirectory: () => Promise<void>;
    validateLocalDirectory: () => Promise<void>;
    setTemplate: (template: string) => void;
    setSelectedFileDataValueIds: (selectedFileDataValueIds: string[]) => void;
    setFileMapping: (fileKey: string, mapping: string) => void;
    setStep: (step: number) => void;
    goNext: () => boolean;
    goBack: () => void;
    setExecution: (
        state:
            | WizardState["execution"]
            | ((previous: WizardState["execution"]) => WizardState["execution"])
    ) => void;
};

const WizardContext = React.createContext<WizardContextValue | null>(null);
const DEFAULT_STEP: WizardStepDefinition = WIZARD_STEPS[0] ?? { id: "program", title: "Program" };

type WizardProviderProps = React.PropsWithChildren<{
    validateStorageConnectionRequest: (config: StorageConnectionConfig) => Promise<void>;
    chooseLocalDirectoryRequest: () => Promise<FileSystemDirectoryHandle>;
    validateLocalDirectoryRequest: (handle?: FileSystemDirectoryHandle) => Promise<void>;
}>;

export const WizardProvider: React.FC<WizardProviderProps> = ({
    children,
    validateStorageConnectionRequest,
    chooseLocalDirectoryRequest,
    validateLocalDirectoryRequest,
}) => {
    const [state, setState] = React.useState<WizardState>(initialWizardState);

    const currentStep = WIZARD_STEPS[state.currentStep] ?? DEFAULT_STEP;

    const currentStepError = React.useMemo(() => {
        return getStepValidationError(state, currentStep.id);
    }, [currentStep.id, state]);

    const setScope: WizardContextValue["setScope"] = React.useCallback(values => {
        setState(previous => {
            const isProgramChange =
                values.selectedProgramId !== undefined &&
                values.selectedProgramId !== previous.selectedProgramId;

            return {
                ...previous,
                ...values,
                selectedOrgUnitId: isProgramChange
                    ? ""
                    : values.selectedOrgUnitId ?? previous.selectedOrgUnitId,
                selectedOrgUnitName: isProgramChange
                    ? ""
                    : values.selectedOrgUnitName ?? previous.selectedOrgUnitName,
                orgUnitSelectionMode: isProgramChange
                    ? "descendants"
                    : values.orgUnitSelectionMode ?? previous.orgUnitSelectionMode,
                dateFrom: isProgramChange ? "" : values.dateFrom ?? previous.dateFrom,
                dateTo: isProgramChange ? "" : values.dateTo ?? previous.dateTo,
                selectedFileDataValueIds: isProgramChange ? [] : previous.selectedFileDataValueIds,
                mappingByFileKey: isProgramChange ? {} : previous.mappingByFileKey,
                execution: initialExecutionState,
            };
        });
    }, []);

    const setStorageMethod = React.useCallback((method: StorageMethod) => {
        setState(previous => ({
            ...previous,
            storage: {
                ...previous.storage,
                selectedMethod: method,
            },
            execution: initialExecutionState,
        }));
    }, []);

    const setWebDAVStorage: WizardContextValue["setWebDAVStorage"] = React.useCallback(values => {
        setState(previous => ({
            ...previous,
            storage: {
                ...previous.storage,
                webdav: {
                    ...previous.storage.webdav,
                    ...values,
                    status: "idle",
                    error: undefined,
                },
            },
            execution: initialExecutionState,
        }));
    }, []);

    const validateWebDAVConnection = React.useCallback(async () => {
        const config: StorageConnectionConfig = {
            url: state.storage.webdav.url,
            username: state.storage.webdav.username,
            password: state.storage.webdav.password,
        };

        setState(previous => ({
            ...previous,
            storage: {
                ...previous.storage,
                webdav: {
                    ...previous.storage.webdav,
                    status: "validating",
                    error: undefined,
                },
            },
        }));

        try {
            await validateStorageConnectionRequest(config);
            setState(previous => ({
                ...previous,
                storage: {
                    ...previous.storage,
                    webdav: {
                        ...previous.storage.webdav,
                        status: "valid",
                        error: undefined,
                    },
                },
            }));
        } catch (error: unknown) {
            setState(previous => ({
                ...previous,
                storage: {
                    ...previous.storage,
                    webdav: {
                        ...previous.storage.webdav,
                        status: "invalid",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Connection validation failed. Ensure the WebDAV URL is correct, credentials are valid, and the server allows cross-origin requests from this app.",
                    },
                },
            }));
        }
    }, [state.storage.webdav, validateStorageConnectionRequest]);

    const chooseLocalDirectory = React.useCallback(async () => {
        try {
            const directoryHandle = await chooseLocalDirectoryRequest();
            setState(previous => ({
                ...previous,
                storage: {
                    ...previous.storage,
                    localDirectory: {
                        directoryHandle,
                        directoryName: directoryHandle.name,
                        status: "idle",
                        error: undefined,
                    },
                },
                execution: initialExecutionState,
            }));
        } catch (error: unknown) {
            setState(previous => ({
                ...previous,
                storage: {
                    ...previous.storage,
                    localDirectory: {
                        ...previous.storage.localDirectory,
                        status: "invalid",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Could not open the local directory picker.",
                    },
                },
                execution: initialExecutionState,
            }));
        }
    }, [chooseLocalDirectoryRequest]);

    const validateLocalDirectory = React.useCallback(async () => {
        setState(previous => ({
            ...previous,
            storage: {
                ...previous.storage,
                localDirectory: {
                    ...previous.storage.localDirectory,
                    status: "validating",
                    error: undefined,
                },
            },
        }));

        try {
            await validateLocalDirectoryRequest(state.storage.localDirectory.directoryHandle);
            setState(previous => ({
                ...previous,
                storage: {
                    ...previous.storage,
                    localDirectory: {
                        ...previous.storage.localDirectory,
                        status: "valid",
                        error: undefined,
                    },
                },
            }));
        } catch (error: unknown) {
            setState(previous => ({
                ...previous,
                storage: {
                    ...previous.storage,
                    localDirectory: {
                        ...previous.storage.localDirectory,
                        status: "invalid",
                        error:
                            error instanceof Error
                                ? error.message
                                : "Local directory validation failed.",
                    },
                },
            }));
        }
    }, [state.storage.localDirectory.directoryHandle, validateLocalDirectoryRequest]);

    const setTemplate = React.useCallback((template: string) => {
        setState(previous => ({
            ...previous,
            template,
            templateError: validateTemplate(template),
            execution: initialExecutionState,
        }));
    }, []);

    const setSelectedFileDataValueIds = React.useCallback((selectedFileDataValueIds: string[]) => {
        setState(previous => {
            const normalizedIds = Array.from(new Set(selectedFileDataValueIds));
            const normalizedIdSet = new Set(normalizedIds);
            const mappingByFileKey = normalizedIds.reduce<Record<string, string>>(
                (acc, fileKey) => {
                    acc[fileKey] = previous.mappingByFileKey[fileKey] ?? "";
                    return acc;
                },
                {}
            );

            return {
                ...previous,
                selectedFileDataValueIds: normalizedIds,
                mappingByFileKey,
                execution:
                    normalizedIdSet.size === previous.selectedFileDataValueIds.length &&
                    previous.selectedFileDataValueIds.every(fileKey => normalizedIdSet.has(fileKey))
                        ? previous.execution
                        : initialExecutionState,
            };
        });
    }, []);

    const setFileMapping = React.useCallback((fileKey: string, mapping: string) => {
        setState(previous => ({
            ...previous,
            mappingByFileKey: {
                ...previous.mappingByFileKey,
                [fileKey]: mapping,
            },
            execution: initialExecutionState,
        }));
    }, []);

    const setStep = React.useCallback((step: number) => {
        setState(previous => ({
            ...previous,
            currentStep: Math.max(0, Math.min(step, WIZARD_STEPS.length - 1)),
        }));
    }, []);

    const goNext = React.useCallback(() => {
        const stepId = (WIZARD_STEPS[state.currentStep] ?? DEFAULT_STEP).id;
        const error = getStepValidationError(state, stepId);
        if (error) {
            return false;
        }

        setState(previous => ({
            ...previous,
            currentStep: Math.min(previous.currentStep + 1, WIZARD_STEPS.length - 1),
        }));
        return true;
    }, [state]);

    const goBack = React.useCallback(() => {
        setState(previous => ({
            ...previous,
            currentStep: Math.max(previous.currentStep - 1, 0),
        }));
    }, []);

    const setExecution = React.useCallback<WizardContextValue["setExecution"]>(execution => {
        setState(previous => ({
            ...previous,
            execution: typeof execution === "function" ? execution(previous.execution) : execution,
        }));
    }, []);

    const value = React.useMemo<WizardContextValue>(
        () => ({
            state,
            currentStepId: currentStep.id,
            currentStepTitle: currentStep.title,
            currentStepError,
            setScope,
            setStorageMethod,
            setWebDAVStorage,
            validateWebDAVConnection,
            chooseLocalDirectory,
            validateLocalDirectory,
            setTemplate,
            setSelectedFileDataValueIds,
            setFileMapping,
            setStep,
            goNext,
            goBack,
            setExecution,
        }),
        [
            currentStep.id,
            currentStep.title,
            currentStepError,
            chooseLocalDirectory,
            goBack,
            goNext,
            setExecution,
            setScope,
            setStorageMethod,
            setWebDAVStorage,
            setTemplate,
            setSelectedFileDataValueIds,
            setFileMapping,
            setStep,
            state,
            validateLocalDirectory,
            validateWebDAVConnection,
        ]
    );

    return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
};

export function useWizardContext(): WizardContextValue {
    const context = React.useContext(WizardContext);
    if (!context) {
        throw new Error("useWizardContext must be used within WizardProvider");
    }
    return context;
}
