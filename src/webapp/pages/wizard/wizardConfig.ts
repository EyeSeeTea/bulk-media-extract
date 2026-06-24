import type { ExportExecutionReport } from "$/application/export/ExportExecution";
import type { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";

export type WizardStepId = "program" | "template" | "preview" | "storage" | "execution";

export type StorageMethod = "webdav" | "local-directory";

export type WizardStorageValidationStatus = "idle" | "validating" | "valid" | "invalid";

export type WizardWebDAVStorageConfig = {
    url: string;
    username: string;
    password: string;
    status: WizardStorageValidationStatus;
    error?: string;
};

export type WizardLocalDirectoryStorageConfig = {
    directoryHandle?: FileSystemDirectoryHandle;
    directoryName: string;
    status: WizardStorageValidationStatus;
    error?: string;
};

export type WizardStorageConfig = {
    selectedMethod: StorageMethod;
    webdav: WizardWebDAVStorageConfig;
    localDirectory: WizardLocalDirectoryStorageConfig;
};

export type WizardExecutionLogEntry = {
    id: string;
    timestamp: string;
    status: "info" | "success" | "failure" | "warning";
    message: string;
    targetPath?: string;
};

export type WizardExecutionState = {
    status: "idle" | "running" | "success" | "partial-failure" | "failed" | "interrupted";
    progress: number;
    processed: number;
    total: number;
    successCount: number;
    failureCount: number;
    currentTargetPath?: string;
    error?: string;
    report?: ExportExecutionReport;
    logEntries: WizardExecutionLogEntry[];
};

export type WizardState = {
    currentStep: number;
    selectedProgramId: string;
    selectedOrgUnitId: string;
    selectedOrgUnitName?: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    dateFrom: string;
    dateTo: string;
    storage: WizardStorageConfig;
    template: string;
    templateError?: string;
    selectedFileDataValueIds: string[];
    mappingByFileKey: Record<string, string>;
    execution: WizardExecutionState;
};

export type StepValidationResult = {
    error?: string;
    hasInlineNotice?: boolean;
};

export type WizardStepDefinition = {
    id: WizardStepId;
    title: string;
};

export const WIZARD_STEPS: WizardStepDefinition[] = [
    { id: "program", title: "Program" },
    { id: "template", title: "Template" },
    { id: "preview", title: "Preview" },
    { id: "storage", title: "Storage" },
    { id: "execution", title: "Execution" },
];

const TEMPLATE_TOKEN =
    /\{(?:orgUnitName|orgUnitId|orgUnitCode|orgUnitShortName|orgUnitPath|orgUnitLevel|enrollmentDate|fileName|fileExtension|fileDataElementId|fileDataElementName|fileProgramStageId|fileProgramStageName|fileValueType|currentDataElementName|currentDataElementCode|random|attribute:[A-Za-z0-9_-]+|dataElement:[A-Za-z0-9_-]+|orgUnitAttribute:[A-Za-z0-9_-]+)\}/g;

function isDateRangeOrdered(dateFrom: string, dateTo: string): boolean {
    if (!dateFrom || !dateTo) {
        return true;
    }

    return new Date(dateFrom).getTime() <= new Date(dateTo).getTime();
}

export function validateTemplate(template: string): string | undefined {
    if (!template.trim()) {
        return "Template is required.";
    }

    const openBraces = (template.match(/\{/g) ?? []).length;
    const closeBraces = (template.match(/\}/g) ?? []).length;
    if (openBraces !== closeBraces) {
        return "Template has unbalanced braces.";
    }

    const candidates = template.match(/\{[^}]+\}/g) ?? [];
    const hasInvalidToken = candidates.some(token => !token.match(TEMPLATE_TOKEN));
    if (hasInvalidToken) {
        return "Template contains unsupported token syntax.";
    }

    return undefined;
}

export function getStepValidationError(
    state: WizardState,
    stepId: WizardStepId
): string | undefined {
    if (stepId === "program") {
        if (!state.selectedProgramId) {
            return "Program is required.";
        }
        if (state.selectedFileDataValueIds.length === 0) {
            return "Select at least one file data value to sync.";
        }
    }

    if (stepId === "template") {
        if (!state.selectedOrgUnitId) {
            return "Organisation unit is required.";
        }

        if (!isDateRangeOrdered(state.dateFrom, state.dateTo)) {
            return "Date range is invalid. End date must be after start date.";
        }

        const hasMissingTemplateForSelectedFile = state.selectedFileDataValueIds.some(fileKey => {
            return !state.mappingByFileKey[fileKey]?.trim();
        });
        if (hasMissingTemplateForSelectedFile) {
            return "A mapping is required for each selected file.";
        }

        for (const fileKey of state.selectedFileDataValueIds) {
            const templateError = validateTemplate(state.mappingByFileKey[fileKey] ?? "");
            if (templateError) {
                return `Template is invalid for selected file "${fileKey}": ${templateError}`;
            }
        }
    }

    if (stepId === "storage") {
        if (!state.storage.selectedMethod) {
            return "Select a storage method before continuing.";
        }

        if (state.storage.selectedMethod === "webdav") {
            if (
                !state.storage.webdav.url ||
                !state.storage.webdav.username ||
                !state.storage.webdav.password
            ) {
                return "Storage URL, username, and password are required.";
            }
            if (state.storage.webdav.status !== "valid") {
                return "Test the WebDAV connection successfully before continuing.";
            }
        }

        if (state.storage.selectedMethod === "local-directory") {
            if (!state.storage.localDirectory.directoryHandle) {
                return "Select a local directory before continuing.";
            }

            if (state.storage.localDirectory.status !== "valid") {
                return "Validate the selected local directory before continuing.";
            }
        }
    }

    if (stepId === "preview") {
        if (!state.selectedProgramId || !state.selectedOrgUnitId) {
            return "Program and organisation unit are required before preview.";
        }
    }

    return undefined;
}

export function isStorageMethodReady(storage: WizardStorageConfig): boolean {
    if (storage.selectedMethod === "webdav") {
        return storage.webdav.status === "valid";
    }

    if (storage.selectedMethod === "local-directory") {
        return storage.localDirectory.status === "valid";
    }

    return false;
}

export function getStorageMethodError(storage: WizardStorageConfig): string | undefined {
    if (storage.selectedMethod === "webdav") {
        return storage.webdav.error;
    }

    if (storage.selectedMethod === "local-directory") {
        return storage.localDirectory.error;
    }

    return undefined;
}

export function getStorageMethodStatus(
    storage: WizardStorageConfig
): WizardStorageValidationStatus {
    if (storage.selectedMethod === "webdav") {
        return storage.webdav.status;
    }

    if (storage.selectedMethod === "local-directory") {
        return storage.localDirectory.status;
    }

    return "idle";
}

export function getStorageValidationError(state: WizardState): string | undefined {
    if (state.storage.selectedMethod === "webdav") {
        if (
            !state.storage.webdav.url ||
            !state.storage.webdav.username ||
            !state.storage.webdav.password
        ) {
            return "Storage URL, username, and password are required.";
        }
        if (state.storage.webdav.status !== "valid") {
            return "Test the WebDAV connection successfully before continuing.";
        }
    }

    if (state.storage.selectedMethod === "local-directory") {
        if (!state.storage.localDirectory.directoryHandle) {
            return "Select a local directory before continuing.";
        }
        if (state.storage.localDirectory.status !== "valid") {
            return "Validate the selected local directory before continuing.";
        }
    }

    return undefined;
}

export const initialExecutionState: WizardExecutionState = {
    status: "idle",
    progress: 0,
    processed: 0,
    total: 0,
    successCount: 0,
    failureCount: 0,
    logEntries: [],
};

export const initialWizardState: WizardState = {
    currentStep: 0,
    selectedProgramId: "",
    selectedOrgUnitId: "",
    selectedOrgUnitName: "",
    orgUnitSelectionMode: "descendants",
    dateFrom: "",
    dateTo: "",
    storage: {
        selectedMethod: "webdav",
        webdav: {
            url: "",
            username: "",
            password: "",
            status: "idle",
        },
        localDirectory: {
            directoryName: "",
            status: "idle",
        },
    },
    template: "/{orgUnitName}/{enrollmentDate}/{dataElement:file}.pdf",
    selectedFileDataValueIds: [],
    mappingByFileKey: {},
    execution: initialExecutionState,
};
