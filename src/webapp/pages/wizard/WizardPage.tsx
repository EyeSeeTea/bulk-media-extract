import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import {
    ProgramEventPreview,
    ProgramFileProperties,
    ProgramFileProperty,
} from "$/domain/entities/FileExportProgram";
import { OrgUnitTreePicker } from "$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { useFileCapablePrograms } from "$/webapp/pages/landing/hooks/useFileCapablePrograms";
import { useProgramEventsPreview } from "$/webapp/pages/landing/hooks/useProgramEventsPreview";
import { useProgramFileProperties } from "$/webapp/pages/landing/hooks/useProgramFileProperties";
import i18n from "$/utils/i18n";
import { useWizardContext, WizardProvider } from "$/webapp/pages/wizard/WizardContext";
import {
    OrgUnitSelectionMode,
    WizardStepId,
    getStepValidationError,
    WIZARD_STEPS,
} from "$/webapp/pages/wizard/wizardConfig";
import {
    getPropertyTemplateToken,
    insertAtCursor,
    resolveTemplateForEvent,
} from "$/webapp/pages/wizard/templateBuilder";
import "./WizardPage.css";

type ProgramOption = {
    id: string;
    name: string;
    organisationUnits: Array<{ id: string; name: string; path?: string }>;
};

type PreviewRow = {
    event: ProgramEventPreview;
    resolvedTemplate: string;
};

const FILE_VALUE_TYPES = new Set(["FILE_RESOURCE", "IMAGE"]);

export const WizardPage: React.FC = React.memo(() => {
    return (
        <WizardProvider>
            <WizardContent />
        </WizardProvider>
    );
});

const WizardContent: React.FC = () => {
    const {
        state,
        currentStepId,
        currentStepTitle,
        currentStepError,
        setScope,
        setStorage,
        validateStorageConnection,
        setTemplate,
        setStep,
        goBack,
        goNext,
        setExecution,
    } = useWizardContext();

    const { state: programsState } = useFileCapablePrograms();
    const { state: programDetailsState } = useProgramFileProperties(state.selectedProgramId);

    const selectedProgram = React.useMemo(() => {
        if (programsState.status !== "success") {
            return undefined;
        }
        return programsState.data.find(program => program.id === state.selectedProgramId);
    }, [programsState, state.selectedProgramId]);

    React.useEffect(() => {
        if (!selectedProgram) {
            return;
        }
        if (state.selectedOrgUnitId) {
            return;
        }

        const firstRootOrgUnitId = selectedProgram.organisationUnits[0]?.id;
        if (firstRootOrgUnitId) {
            setScope({
                selectedOrgUnitId: firstRootOrgUnitId,
                orgUnitSelectionMode: "descendants",
            });
        }
    }, [selectedProgram, setScope, state.selectedOrgUnitId]);

    const previewEnabled = currentStepId === "preview";
    const isTemplateValid = !state.templateError;
    const canPreviewFromTemplateStep = Boolean(
        currentStepId === "template" &&
            state.selectedProgramId &&
            state.selectedOrgUnitId &&
            isTemplateValid
    );
    const { state: previewState, reload: reloadPreview } = useProgramEventsPreview(
        state.selectedProgramId,
        state.selectedOrgUnitId,
        {
            enabled: previewEnabled || canPreviewFromTemplateStep,
        }
    );

    React.useEffect(() => {
        if (!canPreviewFromTemplateStep) {
            return;
        }
        if (previewState.status !== "idle") {
            return;
        }
        void reloadPreview();
    }, [canPreviewFromTemplateStep, previewState.status, reloadPreview]);

    const filteredPreview = React.useMemo(() => {
        if (previewState.status !== "success") {
            return [];
        }

        const from = state.dateFrom ? new Date(state.dateFrom).getTime() : undefined;
        const to = state.dateTo ? new Date(state.dateTo).getTime() : undefined;

        return previewState.data.filter(event => {
            if (!event.eventDate) {
                return false;
            }
            const timestamp = new Date(event.eventDate).getTime();
            if (from !== undefined && timestamp < from) {
                return false;
            }
            if (to !== undefined && timestamp > to) {
                return false;
            }
            return true;
        });
    }, [previewState, state.dateFrom, state.dateTo]);

    const previewRows = React.useMemo<PreviewRow[]>(() => {
        if (!isTemplateValid) {
            return [];
        }

        return filteredPreview.slice(0, 10).map(event => ({
            event,
            resolvedTemplate: resolveTemplateForEvent(state.template, event),
        }));
    }, [filteredPreview, isTemplateValid, state.template]);

    const templateInputRef = React.useRef<HTMLTextAreaElement | null>(null);

    const onInsertTemplateToken = React.useCallback(
        (token: string) => {
            const input = templateInputRef.current;
            const result = insertAtCursor(
                state.template,
                token,
                input?.selectionStart,
                input?.selectionEnd
            );
            setTemplate(result.value);

            window.setTimeout(() => {
                if (!templateInputRef.current) {
                    return;
                }
                templateInputRef.current.focus();
                templateInputRef.current.setSelectionRange(result.caret, result.caret);
            }, 0);
        },
        [setTemplate, state.template]
    );

    const onRunExecution = React.useCallback(async () => {
        setExecution({ status: "running", progress: 0 });

        const chunks = Math.max(filteredPreview.length, 3);
        for (let index = 1; index <= chunks; index += 1) {
            await new Promise(resolve => {
                setTimeout(resolve, 180);
            });
            setExecution({
                status: "running",
                progress: Math.round((index / chunks) * 100),
            });
        }

        if (state.storage.url.includes("fail")) {
            setExecution({
                status: "error",
                progress: 0,
                error: "Export failed. Update storage configuration and retry.",
            });
            return;
        }

        setExecution({ status: "success", progress: 100 });
    }, [filteredPreview.length, setExecution, state.storage.url]);

    const canNavigateToStep = React.useCallback(
        (targetIndex: number): boolean => {
            if (targetIndex <= state.currentStep) {
                return true;
            }

            for (let index = 0; index < targetIndex; index += 1) {
                const step = WIZARD_STEPS[index];
                if (!step) {
                    return false;
                }
                if (getStepValidationError(state, step.id)) {
                    return false;
                }
            }

            return true;
        },
        [state]
    );

    const renderStep = (stepId: WizardStepId) => {
        switch (stepId) {
            case "program":
                return (
                    <ProgramStep
                        programsState={programsState}
                        selectedProgramId={state.selectedProgramId}
                        programDetailsState={programDetailsState}
                        onSelectProgram={programId => setScope({ selectedProgramId: programId })}
                    />
                );
            case "template":
                return (
                    <TemplateStep
                        selectedProgram={selectedProgram}
                        programDetailsState={programDetailsState}
                        selectedOrgUnitId={state.selectedOrgUnitId}
                        orgUnitSelectionMode={state.orgUnitSelectionMode}
                        dateFrom={state.dateFrom}
                        dateTo={state.dateTo}
                        value={state.template}
                        templateError={state.templateError}
                        templateInputRef={templateInputRef}
                        quickPreviewState={previewState}
                        quickPreviewRows={previewRows}
                        onSelectOrgUnit={selectedOrgUnitId => setScope({ selectedOrgUnitId })}
                        onSelectionModeChange={orgUnitSelectionMode =>
                            setScope({ orgUnitSelectionMode })
                        }
                        onDateFromChange={dateFrom => setScope({ dateFrom })}
                        onDateToChange={dateTo => setScope({ dateTo })}
                        onTemplateChange={setTemplate}
                        onInsertTemplateToken={onInsertTemplateToken}
                        onRetryPreview={() => {
                            void reloadPreview();
                        }}
                    />
                );
            case "storage":
                return (
                    <StorageStep
                        url={state.storage.url}
                        username={state.storage.username}
                        password={state.storage.password}
                        connectionStatus={state.connectionStatus}
                        connectionError={state.connectionError}
                        onUrlChange={url => setStorage({ url })}
                        onUsernameChange={username => setStorage({ username })}
                        onPasswordChange={password => setStorage({ password })}
                        onValidate={() => {
                            void validateStorageConnection();
                        }}
                    />
                );
            case "preview":
                return (
                    <PreviewStep
                        selectedProgramId={state.selectedProgramId}
                        selectedOrgUnitId={state.selectedOrgUnitId}
                        orgUnitSelectionMode={state.orgUnitSelectionMode}
                        dateFrom={state.dateFrom}
                        dateTo={state.dateTo}
                        previewState={previewState}
                        filteredPreview={filteredPreview}
                        previewRows={previewRows}
                        onRetry={() => {
                            void reloadPreview();
                        }}
                    />
                );
            case "execution":
                return (
                    <ExecutionStep
                        executionState={state.execution}
                        onRun={() => {
                            void onRunExecution();
                        }}
                        onRetry={() => {
                            void onRunExecution();
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="wizard-page">
            <h2>{i18n.t("File Export Wizard")}</h2>
            <p className="wizard-subtitle">
                {i18n.t("Step {{step}} of {{total}}: {{title}}", {
                    step: String(state.currentStep + 1),
                    total: String(WIZARD_STEPS.length),
                    title: currentStepTitle,
                })}
            </p>

            <ol className="wizard-steps" aria-label="wizard-steps">
                {WIZARD_STEPS.map((step, index) => {
                    const className =
                        index === state.currentStep ? "active" : index < state.currentStep ? "done" : "";
                    const isAvailable = canNavigateToStep(index);
                    return (
                        <li key={step.id} className={className}>
                            <button
                                type="button"
                                className="wizard-step-tab"
                                disabled={!isAvailable}
                                data-testid={`wizard-step-tab-${step.id}`}
                                onClick={() => {
                                    if (isAvailable) {
                                        setStep(index);
                                    }
                                }}
                            >
                                {step.title}
                            </button>
                        </li>
                    );
                })}
            </ol>

            <section className="panel wizard-panel">{renderStep(currentStepId)}</section>

            {currentStepError ? (
                <NoticeBox warning title={i18n.t("Validation required")}>
                    {currentStepError}
                </NoticeBox>
            ) : null}

            <div className="actions-row wizard-actions">
                <Button disabled={state.currentStep === 0} onClick={goBack}>
                    {i18n.t("Back")}
                </Button>
                {state.currentStep < WIZARD_STEPS.length - 1 ? (
                    <Button primary onClick={goNext}>
                        {i18n.t("Next")}
                    </Button>
                ) : null}
            </div>
        </div>
    );
};

type ProgramStepProps = {
    programsState: AsyncData<ProgramOption[]>;
    selectedProgramId: string;
    programDetailsState: AsyncData<{ properties: ProgramFileProperty[] }>;
    onSelectProgram: (programId: string) => void;
};

const ProgramStep: React.FC<ProgramStepProps> = ({
    programsState,
    selectedProgramId,
    programDetailsState,
    onSelectProgram,
}) => {
    const fileDataElements = React.useMemo(() => {
        if (programDetailsState.status !== "success") {
            return [];
        }

        return programDetailsState.data.properties.filter(
            property =>
                property.sourceType === "dataElement" && FILE_VALUE_TYPES.has(property.valueType)
        );
    }, [programDetailsState]);

    return (
        <div className="wizard-step-content" aria-label="wizard-step-program">
            <h3>{i18n.t("Select program")}</h3>
            {programsState.status === "loading" ? <CircularLoader small /> : null}
            {programsState.status === "error" ? (
                <NoticeBox error title={i18n.t("Could not load programs")}>{programsState.error}</NoticeBox>
            ) : null}
            {programsState.status === "success" ? (
                <>
                    <label className="field-label" htmlFor="wizard-program">
                        {i18n.t("Program")}
                    </label>
                    <select
                        id="wizard-program"
                        data-testid="wizard-program-select"
                        value={selectedProgramId}
                        onChange={event => onSelectProgram(event.target.value)}
                    >
                        <option value="">{i18n.t("Choose a program")}</option>
                        {programsState.data.map(program => (
                            <option key={program.id} value={program.id}>
                                {program.name}
                            </option>
                        ))}
                    </select>
                </>
            ) : null}

            <h4>{i18n.t("File data elements preview")}</h4>
            {!selectedProgramId ? (
                <NoticeBox title={i18n.t("Program required")}>
                    {i18n.t("Select a program to inspect file data elements.")}
                </NoticeBox>
            ) : programDetailsState.status === "loading" ? (
                <CircularLoader small />
            ) : programDetailsState.status === "error" ? (
                <NoticeBox error title={i18n.t("Could not inspect program")}>
                    {programDetailsState.error}
                </NoticeBox>
            ) : fileDataElements.length === 0 ? (
                <NoticeBox title={i18n.t("No file data elements")}>
                    {i18n.t("No file-capable data elements were found in this program.")}
                </NoticeBox>
            ) : (
                <table className="preview-table" data-testid="wizard-file-data-elements">
                    <thead>
                        <tr>
                            <th>{i18n.t("Data element")}</th>
                            <th>{i18n.t("Value type")}</th>
                            <th>{i18n.t("Program stage")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fileDataElements.map(item => (
                            <tr key={item.id}>
                                <td>{item.name}</td>
                                <td>{item.valueType}</td>
                                <td>{item.sourceContainerName ?? "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

type TemplateStepProps = {
    selectedProgram?: ProgramOption;
    programDetailsState: AsyncData<ProgramFileProperties>;
    selectedOrgUnitId: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    dateFrom: string;
    dateTo: string;
    value: string;
    templateError?: string;
    templateInputRef: React.RefObject<HTMLTextAreaElement | null>;
    quickPreviewState: AsyncData<ProgramEventPreview[]>;
    quickPreviewRows: PreviewRow[];
    onSelectOrgUnit: (orgUnitId: string) => void;
    onSelectionModeChange: (mode: OrgUnitSelectionMode) => void;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onTemplateChange: (template: string) => void;
    onInsertTemplateToken: (token: string) => void;
    onRetryPreview: () => void;
};

const TemplateStep: React.FC<TemplateStepProps> = ({
    selectedProgram,
    programDetailsState,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    dateFrom,
    dateTo,
    value,
    templateError,
    templateInputRef,
    quickPreviewState,
    quickPreviewRows,
    onSelectOrgUnit,
    onSelectionModeChange,
    onDateFromChange,
    onDateToChange,
    onTemplateChange,
    onInsertTemplateToken,
    onRetryPreview,
}) => {
    const hasPreviewScope = Boolean(selectedProgram && selectedOrgUnitId);

    return (
        <div className="wizard-step-content" aria-label="wizard-step-template">
            <h3>{i18n.t("Template")}</h3>

            <section className="wizard-section">
                <h4>{i18n.t("Filters")}</h4>

                <label className="field-label" htmlFor="wizard-org-unit-tree">
                    {i18n.t("Organisation unit")}
                </label>
                {!selectedProgram ? (
                    <NoticeBox title={i18n.t("Program required")}>
                        {i18n.t("Select a program first to filter by organisation unit.")}
                    </NoticeBox>
                ) : (
                    <OrgUnitTreePicker
                        programOrgUnits={selectedProgram.organisationUnits}
                        selected={selectedOrgUnitId}
                        onChange={onSelectOrgUnit}
                    />
                )}

                <label className="field-label" htmlFor="wizard-org-unit-mode">
                    {i18n.t("Include")}
                </label>
                <select
                    id="wizard-org-unit-mode"
                    data-testid="wizard-org-unit-mode"
                    value={orgUnitSelectionMode}
                    onChange={event =>
                        onSelectionModeChange(event.target.value as OrgUnitSelectionMode)
                    }
                >
                    <option value="selected">{i18n.t("Selected")}</option>
                    <option value="descendants">{i18n.t("Descendants")}</option>
                </select>

                <div className="date-grid">
                    <div>
                        <label className="field-label" htmlFor="wizard-date-from">
                            {i18n.t("Date from (optional)")}
                        </label>
                        <input
                            id="wizard-date-from"
                            data-testid="wizard-date-from"
                            type="date"
                            value={dateFrom}
                            onChange={event => onDateFromChange(event.target.value)}
                        />
                    </div>
                    <div>
                        <label className="field-label" htmlFor="wizard-date-to">
                            {i18n.t("Date to (optional)")}
                        </label>
                        <input
                            id="wizard-date-to"
                            data-testid="wizard-date-to"
                            type="date"
                            value={dateTo}
                            onChange={event => onDateToChange(event.target.value)}
                        />
                    </div>
                </div>
            </section>

            <section className="wizard-section">
                <h4>{i18n.t("Path and filename template")}</h4>
                <p>
                    {i18n.t(
                        "Use tokens like {orgUnitName}, {enrollmentDate}, {attribute:NationalID}, {dataElement:FileName}."
                    )}
                </p>
                <div className="template-builder-grid">
                    <div className="template-editor-panel">
                        <textarea
                            ref={templateInputRef}
                            data-testid="wizard-template-input"
                            rows={5}
                            value={value}
                            onChange={event => onTemplateChange(event.target.value)}
                        />
                    </div>
                    <div className="template-properties-panel">
                        <h5>{i18n.t("Available properties")}</h5>
                        {!selectedProgram ? (
                            <NoticeBox title={i18n.t("Program required")}>
                                {i18n.t("Select a program to inspect available properties.")}
                            </NoticeBox>
                        ) : programDetailsState.status === "loading" ? (
                            <CircularLoader small />
                        ) : programDetailsState.status === "error" ? (
                            <NoticeBox error title={i18n.t("Could not inspect program properties")}>
                                {programDetailsState.error}
                            </NoticeBox>
                        ) : programDetailsState.status === "success" &&
                          programDetailsState.data.propertyGroups.length > 0 ? (
                            <div className="template-property-groups" data-testid="wizard-property-groups">
                                {programDetailsState.data.propertyGroups.map(group => (
                                    <div key={group.id} className="template-property-group">
                                        <p className="template-property-group-title">{group.name}</p>
                                        <ul>
                                            {group.properties.map(property => {
                                                const token = getPropertyTemplateToken(property);
                                                return (
                                                    <li key={`${group.id}:${property.sourceType}:${property.id}`}>
                                                        <button
                                                            type="button"
                                                            className="template-token-button"
                                                            data-testid={`wizard-token-${property.id}`}
                                                            onClick={() => onInsertTemplateToken(token)}
                                                        >
                                                            {property.name}
                                                            <span>{token}</span>
                                                        </button>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <NoticeBox title={i18n.t("No properties found")}>
                                {i18n.t("No resolvable properties were found for this program.")}
                            </NoticeBox>
                        )}
                    </div>
                </div>
                {templateError ? (
                    <NoticeBox warning title={i18n.t("Template error")}>{templateError}</NoticeBox>
                ) : (
                    <NoticeBox title={i18n.t("Template ready")}>
                        {i18n.t("Template syntax looks valid.")}
                    </NoticeBox>
                )}
            </section>

            <section className="wizard-section">
                <h4>{i18n.t("Quick preview (first 10 events)")}</h4>
                {!hasPreviewScope ? (
                    <NoticeBox title={i18n.t("Preview requirements")}>
                        {i18n.t("Select program and organisation unit to load quick preview.")}
                    </NoticeBox>
                ) : templateError ? (
                    <NoticeBox warning title={i18n.t("Template error")}>
                        {i18n.t("Fix template errors to render quick preview rows.")}
                    </NoticeBox>
                ) : quickPreviewState.status === "loading" ? (
                    <CircularLoader small />
                ) : quickPreviewState.status === "error" ? (
                    <div>
                        <NoticeBox error title={i18n.t("Could not load quick preview")}>
                            {quickPreviewState.error}
                        </NoticeBox>
                        <div className="actions-row">
                            <Button small onClick={onRetryPreview}>
                                {i18n.t("Retry preview")}
                            </Button>
                        </div>
                    </div>
                ) : quickPreviewRows.length === 0 ? (
                    <NoticeBox title={i18n.t("No events found")}>
                        {i18n.t("No quick preview events match the current selection.")}
                    </NoticeBox>
                ) : (
                    <table className="preview-table" data-testid="wizard-quick-preview-table">
                        <thead>
                            <tr>
                                <th>{i18n.t("Event")}</th>
                                <th>{i18n.t("Date")}</th>
                                <th>{i18n.t("Resolved template")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {quickPreviewRows.map(row => (
                                <tr key={row.event.id}>
                                    <td>{row.event.id}</td>
                                    <td>{row.event.eventDate ?? "-"}</td>
                                    <td>{row.resolvedTemplate || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

type StorageStepProps = {
    url: string;
    username: string;
    password: string;
    connectionStatus: "idle" | "validating" | "valid" | "invalid";
    connectionError?: string;
    onUrlChange: (value: string) => void;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onValidate: () => void;
};

const StorageStep: React.FC<StorageStepProps> = ({
    url,
    username,
    password,
    connectionStatus,
    connectionError,
    onUrlChange,
    onUsernameChange,
    onPasswordChange,
    onValidate,
}) => {
    return (
        <div className="wizard-step-content" aria-label="wizard-step-storage">
            <h3>{i18n.t("Configure storage")}</h3>
            <label className="field-label" htmlFor="wizard-storage-url">
                {i18n.t("Storage URL")}
            </label>
            <input
                id="wizard-storage-url"
                data-testid="wizard-storage-url"
                type="text"
                placeholder="https://storage.example.org/remote.php/dav/files/user"
                value={url}
                onChange={event => onUrlChange(event.target.value)}
            />

            <label className="field-label" htmlFor="wizard-storage-username">
                {i18n.t("Username")}
            </label>
            <input
                id="wizard-storage-username"
                data-testid="wizard-storage-username"
                type="text"
                value={username}
                onChange={event => onUsernameChange(event.target.value)}
            />

            <label className="field-label" htmlFor="wizard-storage-password">
                {i18n.t("Password")}
            </label>
            <input
                id="wizard-storage-password"
                data-testid="wizard-storage-password"
                type="password"
                value={password}
                onChange={event => onPasswordChange(event.target.value)}
            />

            <div className="actions-row">
                <Button disabled={connectionStatus === "validating"} onClick={onValidate}>
                    {i18n.t("Validate connection")}
                </Button>
            </div>

            {connectionStatus === "valid" ? (
                <NoticeBox title={i18n.t("Connection valid")}>
                    {i18n.t("Storage connection validated.")}
                </NoticeBox>
            ) : null}
            {connectionError ? (
                <NoticeBox error title={i18n.t("Connection invalid")}>{connectionError}</NoticeBox>
            ) : null}
        </div>
    );
};

type PreviewStepProps = {
    selectedProgramId: string;
    selectedOrgUnitId: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    dateFrom: string;
    dateTo: string;
    previewState: AsyncData<ProgramEventPreview[]>;
    filteredPreview: ProgramEventPreview[];
    previewRows: PreviewRow[];
    onRetry: () => void;
};

const PreviewStep: React.FC<PreviewStepProps> = ({
    selectedProgramId,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    dateFrom,
    dateTo,
    previewState,
    filteredPreview,
    previewRows,
    onRetry,
}) => {
    const hasScope = Boolean(selectedProgramId && selectedOrgUnitId);

    return (
        <div className="wizard-step-content" aria-label="wizard-step-preview">
            <h3>{i18n.t("Preview events")}</h3>
            <p>
                {i18n.t("Org unit mode: {{mode}}", {
                    mode: orgUnitSelectionMode === "selected" ? "Selected" : "Descendants",
                })}
            </p>
            {!hasScope ? (
                <NoticeBox title={i18n.t("Preview requirements")}>
                    {i18n.t("Select program and organisation unit filter before loading preview.")}
                </NoticeBox>
            ) : null}

            {hasScope && previewState.status === "loading" ? <CircularLoader small /> : null}
            {hasScope && previewState.status === "error" ? (
                <div>
                    <NoticeBox error title={i18n.t("Could not load event preview")}>
                        {previewState.error}
                    </NoticeBox>
                    <div className="actions-row">
                        <Button small onClick={onRetry}>
                            {i18n.t("Retry preview")}
                        </Button>
                    </div>
                </div>
            ) : null}
            {hasScope && previewState.status === "success" ? (
                filteredPreview.length === 0 ? (
                    <NoticeBox title={i18n.t("No events found")}>
                        {dateFrom || dateTo
                            ? i18n.t("No preview events match the selected date filters.")
                            : i18n.t("No preview events match the current selection.")}
                    </NoticeBox>
                ) : (
                    <table className="preview-table">
                        <thead>
                            <tr>
                                <th>{i18n.t("Event")}</th>
                                <th>{i18n.t("Date")}</th>
                                <th>{i18n.t("Org unit")}</th>
                                <th>{i18n.t("File values")}</th>
                                <th>{i18n.t("Resolved template")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {previewRows.map(row => (
                                <tr key={row.event.id}>
                                    <td>{row.event.id}</td>
                                    <td>{row.event.eventDate ?? "-"}</td>
                                    <td>{row.event.orgUnitName ?? row.event.orgUnitId}</td>
                                    <td>
                                        {Object.entries(row.event.fileValues)
                                            .map(([key, value]) => `${key}: ${value}`)
                                            .join(", ") || "-"}
                                    </td>
                                    <td>{row.resolvedTemplate || "-"}</td>
                                </tr>
                            ))}
                            {filteredPreview.length > previewRows.length ? (
                                <tr key="limited-preview-info">
                                    <td colSpan={5}>
                                        {i18n.t(
                                            "Showing first {{count}} events for quick preview.",
                                            {
                                                count: String(previewRows.length),
                                            }
                                        )}
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                )
            ) : null}
        </div>
    );
};

type ExecutionStepProps = {
    executionState: {
        status: "idle" | "running" | "success" | "error";
        progress: number;
        error?: string;
    };
    onRun: () => void;
    onRetry: () => void;
};

const ExecutionStep: React.FC<ExecutionStepProps> = ({ executionState, onRun, onRetry }) => {
    return (
        <div className="wizard-step-content" aria-label="wizard-step-execution">
            <h3>{i18n.t("Run export")}</h3>
            <p>
                {i18n.t(
                    "Start export to upload files using the configured storage and mapping template."
                )}
            </p>
            {executionState.status !== "running" ? (
                <Button primary onClick={executionState.status === "error" ? onRetry : onRun}>
                    {executionState.status === "error" ? i18n.t("Retry export") : i18n.t("Start export")}
                </Button>
            ) : null}

            {executionState.status === "running" ? (
                <div>
                    <CircularLoader small />
                    <p>
                        {i18n.t("Export in progress: {{progress}}%", {
                            progress: String(executionState.progress),
                        })}
                    </p>
                </div>
            ) : null}

            {executionState.status === "success" ? (
                <NoticeBox title={i18n.t("Export completed")}>
                    {i18n.t("All files processed successfully.")}
                </NoticeBox>
            ) : null}

            {executionState.status === "error" ? (
                <NoticeBox error title={i18n.t("Export failed")}>{executionState.error}</NoticeBox>
            ) : null}
        </div>
    );
};
