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
        expect(validateTemplate("/{orgUnitId}/{dataElement:de-file}")).toBeUndefined();
        expect(validateTemplate("/{fileName}/{fileDataElementId}")).toBeUndefined();
        expect(validateTemplate("/{unsupported}")).toBe("Template contains unsupported token syntax.");
        expect(validateTemplate("/{orgUnitName")).toBe("Template has unbalanced braces.");
    });

    it("requires selecting at least one file data value in program step", () => {
        const state = buildState({
            selectedProgramId: "prog-a",
            selectedFileDataValueIds: [],
        });

        expect(getStepValidationError(state, "program")).toBe(
            "Select at least one file data value to sync."
        );
    });

    it("requires mapping for each selected file in template step", () => {
        const state = buildState({
            selectedProgramId: "prog-a",
            selectedOrgUnitId: "ou-a",
            selectedFileDataValueIds: ["de-file"],
            mappingByFileKey: {},
        });

        expect(getStepValidationError(state, "template")).toBe(
            "A mapping is required for each selected file."
        );
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
