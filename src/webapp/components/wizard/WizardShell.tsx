import React from "react";
import { Button, NoticeBox } from "@dhis2/ui";
import { IconCheckmark24 } from "@dhis2/ui-icons";
import i18n from "$/utils/i18n";
import { WizardStepDefinition } from "$/webapp/pages/wizard/wizardConfig";

type WizardShellProps = {
    currentStep: number;
    steps: WizardStepDefinition[];
    currentStepError?: string;
    currentStepHasInlineNotice?: boolean;
    isExecutionRunning: boolean;
    canNavigateToStep: (targetIndex: number) => boolean;
    onSetStep: (step: number) => void;
    onBack: () => void;
    onNext: () => void;
    onFinish: () => void;
    children: React.ReactNode;
};

export const WizardShell: React.FC<WizardShellProps> = ({
    currentStep,
    steps,
    currentStepError,
    currentStepHasInlineNotice = false,
    isExecutionRunning,
    canNavigateToStep,
    onSetStep,
    onBack,
    onNext,
    onFinish,
    children,
}) => {
    return (
        <div className="wizard-page">
            <ol className="wizard-steps" aria-label="wizard-steps">
                {steps.map((step, index) => {
                    const isAvailable = canNavigateToStep(index);
                    const stateName =
                        index === currentStep
                            ? "active"
                            : index < currentStep
                            ? "done"
                            : isAvailable
                            ? "available"
                            : "disabled";

                    return (
                        <li
                            key={step.id}
                            className={`wizard-step-item ${stateName}`}
                            data-state={stateName}
                        >
                            <button
                                type="button"
                                className="wizard-step-tab"
                                disabled={!isAvailable}
                                data-testid={`wizard-step-tab-${step.id}`}
                                data-step-state={stateName}
                                aria-current={index === currentStep ? "step" : undefined}
                                onClick={() => {
                                    if (isAvailable) {
                                        onSetStep(index);
                                    }
                                }}
                            >
                                <span className="wizard-step-tab-main">
                                    <span
                                        className="wizard-step-number"
                                        aria-hidden="true"
                                        data-testid={`wizard-step-number-${step.id}`}
                                    >
                                        {index < currentStep ? (
                                            <span data-testid={`wizard-step-complete-${step.id}`}>
                                                <IconCheckmark24 />
                                            </span>
                                        ) : (
                                            String(index + 1)
                                        )}
                                    </span>
                                    <span className="wizard-step-label-group">
                                        <span className="wizard-step-label">
                                            {i18n.t("Step {{number}}", {
                                                number: String(index + 1),
                                            })}
                                        </span>
                                        <span className="wizard-step-title">{step.title}</span>
                                    </span>
                                </span>
                            </button>
                        </li>
                    );
                })}
            </ol>

            <section className="panel wizard-panel">{children}</section>

            {currentStepError && !currentStepHasInlineNotice ? (
                <NoticeBox warning title={i18n.t("Validation required")}>
                    {currentStepError}
                </NoticeBox>
            ) : null}

            <div className="wizard-footer-actions" data-testid="wizard-footer-actions">
                {currentStep > 0 && (
                    <Button secondary disabled={isExecutionRunning} onClick={onBack}>
                        {i18n.t("Back")}
                    </Button>
                )}
                <span className="wizard-footer-spacer" />
                {currentStep < steps.length - 1 ? (
                    <Button primary disabled={!!currentStepError} onClick={onNext}>
                        {i18n.t("Next")}
                    </Button>
                ) : (
                    <Button primary disabled={isExecutionRunning} onClick={onFinish}>
                        {i18n.t("Finish")}
                    </Button>
                )}
            </div>
        </div>
    );
};
