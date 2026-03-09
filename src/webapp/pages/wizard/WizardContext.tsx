import React from "react";
import {
    getStepValidationError,
    initialWizardState,
    validateTemplate,
    WizardStepDefinition,
    WizardState,
    WIZARD_STEPS,
    WizardStorageConfig,
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
                "selectedProgramId" | "selectedOrgUnitId" | "orgUnitSelectionMode" | "dateFrom" | "dateTo"
                | "selectedOrgUnitName"
            >
        >
    ) => void;
    setStorage: (values: Partial<WizardStorageConfig>) => void;
    validateStorageConnection: () => Promise<void>;
    setTemplate: (template: string) => void;
    setSelectedFileDataValueIds: (selectedFileDataValueIds: string[]) => void;
    setFileMapping: (fileKey: string, mapping: string) => void;
    setStep: (step: number) => void;
    goNext: () => boolean;
    goBack: () => void;
    setExecution: (state: WizardState["execution"]) => void;
};

const WizardContext = React.createContext<WizardContextValue | null>(null);
const DEFAULT_STEP: WizardStepDefinition = WIZARD_STEPS[0] ?? { id: "program", title: "Program" };

export const WizardProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
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
                execution: {
                    status: "idle",
                    progress: 0,
                },
            };
        });
    }, []);

    const setStorage: WizardContextValue["setStorage"] = React.useCallback(values => {
        setState(previous => ({
            ...previous,
            storage: {
                ...previous.storage,
                ...values,
            },
            connectionStatus: "idle",
            connectionError: undefined,
        }));
    }, []);

    const validateStorageConnection = React.useCallback(async () => {
        setState(previous => ({
            ...previous,
            connectionStatus: "validating",
            connectionError: undefined,
        }));

        await new Promise(resolve => {
            setTimeout(resolve, 250);
        });

        setState(previous => {
            const { url, username, password } = previous.storage;
            const hasAllValues = Boolean(url && username && password);
            const hasValidProtocol = /^https?:\/\//.test(url);
            const isValid = hasAllValues && hasValidProtocol;

            return {
                ...previous,
                connectionStatus: isValid ? "valid" : "invalid",
                connectionError: isValid
                    ? undefined
                    : "Connection validation failed. Ensure URL starts with http(s) and credentials are provided.",
            };
        });
    }, []);

    const setTemplate = React.useCallback((template: string) => {
        setState(previous => ({
            ...previous,
            template,
            templateError: validateTemplate(template),
        }));
    }, []);

    const setSelectedFileDataValueIds = React.useCallback((selectedFileDataValueIds: string[]) => {
        setState(previous => {
            const normalizedIds = Array.from(new Set(selectedFileDataValueIds));
            const normalizedIdSet = new Set(normalizedIds);
            const mappingByFileKey = normalizedIds.reduce<Record<string, string>>((acc, fileKey) => {
                acc[fileKey] = previous.mappingByFileKey[fileKey] ?? "";
                return acc;
            }, {});

            return {
                ...previous,
                selectedFileDataValueIds: normalizedIds,
                mappingByFileKey,
                execution: normalizedIdSet.size === previous.selectedFileDataValueIds.length &&
                    previous.selectedFileDataValueIds.every(fileKey => normalizedIdSet.has(fileKey))
                    ? previous.execution
                    : { status: "idle", progress: 0 },
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

    const setExecution = React.useCallback((execution: WizardState["execution"]) => {
        setState(previous => ({
            ...previous,
            execution,
        }));
    }, []);

    const value = React.useMemo<WizardContextValue>(
        () => ({
            state,
            currentStepId: currentStep.id,
            currentStepTitle: currentStep.title,
            currentStepError,
            setScope,
            setStorage,
            validateStorageConnection,
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
            goBack,
            goNext,
            setExecution,
            setScope,
            setStorage,
            setTemplate,
            setSelectedFileDataValueIds,
            setFileMapping,
            setStep,
            state,
            validateStorageConnection,
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
