import React from "react";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import {
    getStepValidationError,
    WizardState,
    WizardStepId,
    WIZARD_STEPS,
} from "$/webapp/pages/wizard/wizardConfig";

type UseWizardStepControllerParams = {
    state: WizardState;
    currentStepId: WizardStepId;
    exportPreviewState: AsyncData<ProgramEventsPreviewResult>;
    duplicateTargetPathCount: number;
    setStep: (step: number) => void;
};

export function useWizardStepController({
    state,
    currentStepId,
    exportPreviewState,
    duplicateTargetPathCount,
    setStep,
}: UseWizardStepControllerParams) {
    const getValidationErrorForStep = React.useCallback(
        (stepId: WizardStepId): string | undefined => {
            const baseError = getStepValidationError(state, stepId);
            if (baseError) {
                return baseError;
            }

            if (stepId !== "preview") {
                return undefined;
            }

            if (exportPreviewState.status === "idle" || exportPreviewState.status === "loading") {
                return "Preview results must finish loading before continuing.";
            }

            if (exportPreviewState.status === "error") {
                return "Preview must load successfully before continuing.";
            }

            if (duplicateTargetPathCount > 0) {
                return "Duplicate target filepaths were found. Revise the template to make each export destination unique.";
            }

            return undefined;
        },
        [duplicateTargetPathCount, exportPreviewState.status, state]
    );

    const isExecutionRunning = state.execution.status === "running";
    const currentStepError = getValidationErrorForStep(currentStepId);

    const onNext = React.useCallback(() => {
        const error = getValidationErrorForStep(currentStepId);
        if (error) {
            return;
        }

        setStep(state.currentStep + 1);
    }, [currentStepId, getValidationErrorForStep, setStep, state.currentStep]);

    const canNavigateToStep = React.useCallback(
        (targetIndex: number): boolean => {
            if (isExecutionRunning && targetIndex !== state.currentStep) {
                return false;
            }

            if (targetIndex <= state.currentStep) {
                return true;
            }

            for (let index = 0; index < targetIndex; index += 1) {
                const step = WIZARD_STEPS[index];
                if (!step || getValidationErrorForStep(step.id)) {
                    return false;
                }
            }

            return true;
        },
        [getValidationErrorForStep, isExecutionRunning, state.currentStep]
    );

    return {
        currentStepError,
        isExecutionRunning,
        onNext,
        canNavigateToStep,
    };
}
