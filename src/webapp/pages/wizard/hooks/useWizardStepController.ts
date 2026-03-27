import React from "react";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import {
    getStepValidationError,
    getStorageMethodError,
    StepValidationResult,
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
    const getValidationForStep = React.useCallback(
        (stepId: WizardStepId): StepValidationResult => {
            const baseError = getStepValidationError(state, stepId);
            if (baseError) {
                const hasInlineNotice =
                    stepId === "storage" && Boolean(getStorageMethodError(state.storage));
                return { error: baseError, hasInlineNotice };
            }

            if (stepId !== "preview") {
                return {};
            }

            if (exportPreviewState.status === "idle" || exportPreviewState.status === "loading") {
                return {
                    error: "Preview results must finish loading before continuing.",
                };
            }

            if (exportPreviewState.status === "error") {
                return {
                    error: "Preview must load successfully before continuing.",
                };
            }

            if (duplicateTargetPathCount > 0) {
                return {
                    error: "Duplicate target filepaths were found. Revise the template to make each export destination unique.",
                    hasInlineNotice: true,
                };
            }

            return {};
        },
        [duplicateTargetPathCount, exportPreviewState.status, state]
    );

    const isExecutionRunning = state.execution.status === "running";
    const currentStepValidation = getValidationForStep(currentStepId);
    const currentStepError = currentStepValidation.error;
    const currentStepHasInlineNotice = currentStepValidation.hasInlineNotice ?? false;

    const onNext = React.useCallback(() => {
        const validation = getValidationForStep(currentStepId);
        if (validation.error) {
            return;
        }

        setStep(state.currentStep + 1);
    }, [currentStepId, getValidationForStep, setStep, state.currentStep]);

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
                if (!step || getValidationForStep(step.id).error) {
                    return false;
                }
            }

            return true;
        },
        [getValidationForStep, isExecutionRunning, state.currentStep]
    );

    return {
        currentStepError,
        currentStepHasInlineNotice,
        isExecutionRunning,
        onNext,
        canNavigateToStep,
    };
}
