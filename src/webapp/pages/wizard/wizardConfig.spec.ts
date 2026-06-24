import { describe, expect, it } from "vitest";
import {
    getStepValidationError,
    initialWizardState,
    validateTemplate,
    WizardStorageConfig,
    WIZARD_STEPS,
    WizardState,
} from "$/webapp/pages/wizard/wizardConfig";

type WizardStateOverrides = Partial<Omit<WizardState, "storage">> & {
    storage?: Partial<WizardStorageConfig> & {
        webdav?: Partial<WizardStorageConfig["webdav"]>;
        localDirectory?: Partial<WizardStorageConfig["localDirectory"]>;
    };
};

function buildState(overrides: WizardStateOverrides): WizardState {
    return {
        ...initialWizardState,
        ...overrides,
        storage: {
            ...initialWizardState.storage,
            ...(overrides.storage ?? {}),
            webdav: {
                ...initialWizardState.storage.webdav,
                ...(overrides.storage?.webdav ?? {}),
            },
            localDirectory: {
                ...initialWizardState.storage.localDirectory,
                ...(overrides.storage?.localDirectory ?? {}),
            },
        },
        execution: {
            ...initialWizardState.execution,
            ...(overrides.execution ?? {}),
        },
    };
}

describe("wizardConfig", () => {
    it("orders preview before storage", () => {
        expect(WIZARD_STEPS.map(step => step.id)).toEqual([
            "program",
            "template",
            "preview",
            "storage",
            "execution",
        ]);
    });

    it("validates template token syntax", () => {
        expect(validateTemplate("/{orgUnitName}/{enrollmentDate}")).toBeUndefined();
        expect(validateTemplate("/{orgUnitId}/{dataElement:de-file}")).toBeUndefined();
        expect(validateTemplate("/{fileName}/{fileDataElementId}")).toBeUndefined();
        expect(
            validateTemplate("/{orgUnitCode}/{orgUnitAttribute:zone}/{fileExtension}")
        ).toBeUndefined();
        expect(validateTemplate("/{fileName}-{random}.pdf")).toBeUndefined();
        expect(validateTemplate("/{unsupported}")).toBe(
            "Template contains unsupported token syntax."
        );
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
                selectedMethod: "webdav",
                webdav: {
                    url: "https://dav.example.org",
                    username: "demo",
                    password: "secret",
                    status: "idle",
                },
            },
        });

        expect(getStepValidationError(state, "storage")).toBe(
            "Test the WebDAV connection successfully before continuing."
        );
    });

    it("requires a selected local directory to be validated before proceeding", () => {
        const state = buildState({
            storage: {
                selectedMethod: "local-directory",
                webdav: initialWizardState.storage.webdav,
                localDirectory: {
                    directoryHandle: {} as FileSystemDirectoryHandle,
                    directoryName: "Exports",
                    status: "idle",
                },
            },
        });

        expect(getStepValidationError(state, "storage")).toBe(
            "Validate the selected local directory before continuing."
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
