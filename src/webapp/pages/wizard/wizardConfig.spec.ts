import { describe, expect, it } from "vitest";
import {
    getStepValidationError,
    initialWizardState,
    validateTemplate,
    WizardState,
} from "$/webapp/pages/wizard/wizardConfig";

function buildState(overrides: Partial<WizardState>): WizardState {
    return {
        ...initialWizardState,
        ...overrides,
        storage: {
            ...initialWizardState.storage,
            ...(overrides.storage ?? {}),
        },
        execution: {
            ...initialWizardState.execution,
            ...(overrides.execution ?? {}),
        },
    };
}

describe("wizardConfig", () => {
    it("validates template token syntax", () => {
        expect(validateTemplate("/{orgUnitName}/{enrollmentDate}")).toBeUndefined();
        expect(validateTemplate("/{unsupported}")).toBe("Template contains unsupported token syntax.");
        expect(validateTemplate("/{orgUnitName")).toBe("Template has unbalanced braces.");
    });

    it("requires validated storage connection before proceeding", () => {
        const state = buildState({
            storage: {
                url: "https://dav.example.org",
                username: "demo",
                password: "secret",
            },
            connectionStatus: "idle",
        });

        expect(getStepValidationError(state, "storage")).toBe(
            "Storage connection must be validated before continuing."
        );
    });

    it("allows preview without date filters", () => {
        const state = buildState({
            selectedProgramId: "prog-a",
            selectedOrgUnitId: "__root__",
            dateFrom: "",
            dateTo: "",
        });

        expect(getStepValidationError(state, "preview")).toBeUndefined();
    });
});
