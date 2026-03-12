import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WizardShell } from "$/webapp/components/wizard/WizardShell";
import { WIZARD_STEPS } from "$/webapp/pages/wizard/wizardConfig";

describe("WizardShell", () => {
    it("renders step tabs, validation notice, and footer actions", () => {
        const onSetStep = vi.fn();
        const onBack = vi.fn();
        const onNext = vi.fn();
        const onFinish = vi.fn();

        const view = render(
            <WizardShell
                currentStep={1}
                steps={WIZARD_STEPS}
                currentStepError="Template is required."
                isExecutionRunning={false}
                canNavigateToStep={index => index <= 2}
                onSetStep={onSetStep}
                onBack={onBack}
                onNext={onNext}
                onFinish={onFinish}
            >
                <div>Current step body</div>
            </WizardShell>
        );

        expect(view.getByTestId("wizard-step-tab-template")).toHaveAttribute("aria-current", "step");
        expect(view.getByTestId("wizard-step-complete-program")).toBeInTheDocument();
        expect(view.getByText("Validation required")).toBeInTheDocument();
        expect(view.getByText("Template is required.")).toBeInTheDocument();
        expect(view.getByText("Current step body")).toBeInTheDocument();
        expect(view.getByTestId("wizard-footer-actions")).toBeInTheDocument();

        fireEvent.click(view.getByText("Back"));
        fireEvent.click(view.getByText("Next"));
        fireEvent.click(view.getByTestId("wizard-step-tab-preview"));

        expect(onBack).toHaveBeenCalledTimes(1);
        expect(onNext).toHaveBeenCalledTimes(1);
        expect(onSetStep).toHaveBeenCalledWith(2);
    });
});
