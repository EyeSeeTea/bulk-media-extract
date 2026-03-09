import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import {
    ProgramEventPreview,
    ProgramEventsPreviewResult,
    ProgramFileProperties,
    ProgramFileProperty,
    ProgramFilePropertyGroup,
} from "$/domain/entities/FileExportProgram";
import { OrgUnitTreePicker } from "$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useFileCapablePrograms } from "$/webapp/pages/landing/hooks/useFileCapablePrograms";
import { useProgramEventsPreview } from "$/webapp/pages/landing/hooks/useProgramEventsPreview";
import { useProgramFileProperties } from "$/webapp/pages/landing/hooks/useProgramFileProperties";
import { useOrganisationUnits } from "$/webapp/pages/landing/hooks/useOrganisationUnits";
import {
    buildExportPreviewRows,
    buildCaptureEventUrl,
    ExportPreviewRow,
    formatFileSize,
    getPreviewFileWarning,
    getPreviewCellValue,
    summarizeExportPreview,
} from "$/webapp/pages/wizard/previewUtils";
import {
    buildExportExecutionConfiguration,
    buildExportExecutionConfigurationFilename,
    downloadExportExecutionConfiguration,
    ExportExecutionConfigurationFileMapping,
} from "$/webapp/pages/wizard/exportExecutionConfiguration";
import { useWizardExportPreview } from "$/webapp/pages/wizard/useWizardExportPreview";
import i18n from "$/utils/i18n";
import { useWizardContext, WizardProvider } from "$/webapp/pages/wizard/WizardContext";
import {
    OrgUnitSelectionMode,
    WizardStepId,
    getStepValidationError,
    validateTemplate,
    WIZARD_STEPS,
} from "$/webapp/pages/wizard/wizardConfig";
import {
    getPropertyTemplateToken,
    insertAtCursor,
    resolveTemplateForEvent,
    buildFileMetadataPropertyGroup,
} from "$/webapp/pages/wizard/templateBuilder";
import "./WizardPage.css";

type ProgramOption = {
    id: string;
    name: string;
    organisationUnits: Array<{ id: string; name: string; path?: string }>;
};

const FILE_VALUE_TYPES = new Set(["FILE_RESOURCE", "IMAGE"]);

function filterEventsByDate(
    events: ProgramEventPreview[],
    dateFrom: string,
    dateTo: string
): ProgramEventPreview[] {
    const from = dateFrom ? new Date(dateFrom).getTime() : undefined;
    const to = dateTo ? new Date(dateTo).getTime() : undefined;

    return events.filter(event => {
        if (from === undefined && to === undefined) {
            return true;
        }

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
}

function getVisiblePropertyGroupsForFile(
    propertyGroups: ProgramFileProperties["propertyGroups"],
    selectedFileProperties: ProgramFileProperty[],
    currentFileProperty: ProgramFileProperty
) {
    const fileMetadataGroup = buildFileMetadataPropertyGroup(selectedFileProperties);
    const currentStageId = currentFileProperty.sourceContainerId;
    const scopedGroups = propertyGroups
        .map(group => {
            if (group.sourceType !== "dataElement") {
                return group;
            }

            const properties = group.properties.filter(property => {
                if (!currentStageId) {
                    return true;
                }
                return property.sourceContainerId === currentStageId;
            });

            return ProgramFilePropertyGroup.create({
                id: group.id,
                name: group.name,
                sourceType: group.sourceType,
                properties,
            });
        })
        .filter(group => group.properties.length > 0);

    return fileMetadataGroup ? [...scopedGroups, fileMetadataGroup] : scopedGroups;
}

export const WizardPage: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();

    return (
        <WizardProvider
            validateStorageConnectionRequest={config =>
                compositionRoot.storage.validateConnection.execute(config).toPromise()
            }
        >
            <WizardContent />
        </WizardProvider>
    );
});

const WizardContent: React.FC = () => {
    const { baseUrl } = useAppContext();
    const {
        state,
        currentStepId,
        currentStepTitle,
        setScope,
        setStorage,
        validateStorageConnection,
        setSelectedFileDataValueIds,
        setFileMapping,
        setStep,
        goBack,
        setExecution,
    } = useWizardContext();

    const { state: programsState } = useFileCapablePrograms();
    const { state: programDetailsState } = useProgramFileProperties(state.selectedProgramId);
    const { state: organisationUnitsState } = useOrganisationUnits();

    const selectedProgram = React.useMemo(() => {
        if (programsState.status !== "success") {
            return undefined;
        }
        return programsState.data.find(program => program.id === state.selectedProgramId);
    }, [programsState, state.selectedProgramId]);

    const selectableFileDataElements = React.useMemo(() => {
        if (programDetailsState.status !== "success") {
            return [];
        }

        return programDetailsState.data.properties.filter(
            property =>
                property.sourceType === "dataElement" && FILE_VALUE_TYPES.has(property.valueType)
        );
    }, [programDetailsState]);

    const selectedFileDataElements = React.useMemo(() => {
        const selectedIdSet = new Set(state.selectedFileDataValueIds);
        return selectableFileDataElements.filter(property => selectedIdSet.has(property.id));
    }, [selectableFileDataElements, state.selectedFileDataValueIds]);

    const selectedFilePropertyById = React.useMemo(() => {
        return Object.fromEntries(
            selectedFileDataElements.map(fileProperty => [fileProperty.id, fileProperty])
        );
    }, [selectedFileDataElements]);

    const previewProgramStageId = selectedFileDataElements[0]?.sourceContainerId;
    const previewFileDataElementId = selectedFileDataElements[0]?.id;

    React.useEffect(() => {
        if (programDetailsState.status !== "success") {
            return;
        }

        const selectableIdSet = new Set(selectableFileDataElements.map(property => property.id));
        const normalizedSelection = state.selectedFileDataValueIds.filter(fileKey =>
            selectableIdSet.has(fileKey)
        );
        if (normalizedSelection.length !== state.selectedFileDataValueIds.length) {
            setSelectedFileDataValueIds(normalizedSelection);
        }
    }, [
        programDetailsState.status,
        selectableFileDataElements,
        setSelectedFileDataValueIds,
        state.selectedFileDataValueIds,
    ]);

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

    const firstSelectedTemplate = state.selectedFileDataValueIds[0]
        ? state.mappingByFileKey[state.selectedFileDataValueIds[0]] ?? ""
        : "";
    const activeTemplateForPreview = firstSelectedTemplate || state.template;
    const isTemplateValid = !validateTemplate(activeTemplateForPreview);
    const previewEnabled = currentStepId === "preview";
    const canPreviewFromTemplateStep = Boolean(
        currentStepId === "template" &&
            state.selectedProgramId &&
            state.selectedOrgUnitId &&
            isTemplateValid
    );
    const { state: quickPreviewState, reload: reloadQuickPreview } = useProgramEventsPreview(
        state.selectedProgramId,
        state.selectedOrgUnitId,
        state.orgUnitSelectionMode,
        previewProgramStageId,
        previewFileDataElementId,
        {
            enabled: previewEnabled || canPreviewFromTemplateStep,
        }
    );

    React.useEffect(() => {
        if (!canPreviewFromTemplateStep) {
            return;
        }
        if (quickPreviewState.status !== "idle") {
            return;
        }
        void reloadQuickPreview();
    }, [canPreviewFromTemplateStep, quickPreviewState.status, reloadQuickPreview]);

    const quickPreviewEvents = React.useMemo(() => {
        if (quickPreviewState.status !== "success") {
            return [];
        }

        return filterEventsByDate(quickPreviewState.data.events, state.dateFrom, state.dateTo);
    }, [quickPreviewState, state.dateFrom, state.dateTo]);

    const { state: exportPreviewState, reload: reloadExportPreview } = useWizardExportPreview(
        state.selectedProgramId,
        state.selectedOrgUnitId,
        state.orgUnitSelectionMode,
        selectedFileDataElements.map(fileProperty => ({
            fileDataElementId: fileProperty.id,
            programStageId: fileProperty.sourceContainerId,
        })),
        {
            enabled: previewEnabled,
            pageSize: 100,
        }
    );

    React.useEffect(() => {
        if (!previewEnabled) {
            return;
        }
        if (exportPreviewState.status !== "idle") {
            return;
        }
        void reloadExportPreview();
    }, [exportPreviewState.status, previewEnabled, reloadExportPreview]);

    const quickPreviewByFileKey = React.useMemo<Record<string, string[]>>(() => {
        const previewSource = quickPreviewEvents.slice(0, 10);
        return state.selectedFileDataValueIds.reduce<Record<string, string[]>>((acc, fileKey) => {
            const template = state.mappingByFileKey[fileKey] ?? "";
            const selectedFileProperty = selectedFilePropertyById[fileKey];
            if (!template || validateTemplate(template)) {
                acc[fileKey] = [];
                return acc;
            }

            acc[fileKey] = previewSource
                .filter(event => {
                    if (!selectedFileProperty) {
                        return true;
                    }

                    return Boolean(event.fileNames[selectedFileProperty.id]);
                })
                .map(event =>
                    resolveTemplateForEvent(template, event, selectedFileProperty)
                )
                .filter(value => Boolean(value));
            return acc;
        }, {});
    }, [
        quickPreviewEvents,
        selectedFilePropertyById,
        state.mappingByFileKey,
        state.selectedFileDataValueIds,
    ]);

    const filteredExportPreview = React.useMemo(() => {
        if (exportPreviewState.status !== "success") {
            return [];
        }

        return filterEventsByDate(exportPreviewState.data.events, state.dateFrom, state.dateTo);
    }, [exportPreviewState, state.dateFrom, state.dateTo]);

    const exportPreviewRows = React.useMemo<ExportPreviewRow[]>(() => {
        return buildExportPreviewRows(
            filteredExportPreview,
            selectedFileDataElements,
            state.mappingByFileKey,
            baseUrl
        );
    }, [baseUrl, filteredExportPreview, selectedFileDataElements, state.mappingByFileKey]);

    const exportPreviewSummary = React.useMemo(() => {
        return summarizeExportPreview(exportPreviewRows);
    }, [exportPreviewRows]);

    const exportConfigurationFileMappings = React.useMemo<ExportExecutionConfigurationFileMapping[]>(() => {
        return selectedFileDataElements.map(fileProperty => ({
            id: fileProperty.id,
            name: fileProperty.name,
            template: state.mappingByFileKey[fileProperty.id] ?? "",
            programStageId: fileProperty.sourceContainerId,
            programStageName: fileProperty.sourceContainerName,
        }));
    }, [selectedFileDataElements, state.mappingByFileKey]);

    const selectedOrgUnitName = React.useMemo(() => {
        const availableOrgUnits =
            organisationUnitsState.status === "success" ? organisationUnitsState.data : [];
        const previewEvents =
            exportPreviewState.status === "success"
                ? exportPreviewState.data.events
                : quickPreviewState.status === "success"
                  ? quickPreviewState.data.events
                  : [];
        const selectedOrgUnitNameFromStateOrList =
            state.selectedOrgUnitName ||
            availableOrgUnits.find(orgUnit => orgUnit.id === state.selectedOrgUnitId)?.name;
        const selectedOrgUnitNameFromPreview = previewEvents.find(
            event => event.orgUnitId === state.selectedOrgUnitId
        )?.orgUnitName;
        const selectedOrgUnitNameFromProgram = selectedProgram?.organisationUnits.find(
            orgUnit => orgUnit.id === state.selectedOrgUnitId
        )?.name;

        return (
            selectedOrgUnitNameFromStateOrList ??
            selectedOrgUnitNameFromPreview ??
            selectedOrgUnitNameFromProgram ??
            state.selectedOrgUnitId
        );
    }, [
        exportPreviewState,
        organisationUnitsState,
        quickPreviewState,
        selectedProgram,
        state.selectedOrgUnitName,
        state.selectedOrgUnitId,
    ]);

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

            if (exportPreviewSummary.duplicateTargetPaths.length > 0) {
                return "Duplicate target filepaths were found. Revise the template to make each export destination unique.";
            }

            return undefined;
        },
        [exportPreviewState.status, exportPreviewSummary.duplicateTargetPaths.length, state]
    );

    const currentStepError = getValidationErrorForStep(currentStepId);

    const onRunExecution = React.useCallback(async () => {
        setExecution({ status: "running", progress: 0 });

        const chunks = Math.max(exportPreviewRows.length, 3);
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
    }, [exportPreviewRows.length, setExecution, state.storage.url]);

    const onNext = React.useCallback(() => {
        const error = getValidationErrorForStep(currentStepId);
        if (error) {
            return;
        }

        setStep(state.currentStep + 1);
    }, [currentStepId, getValidationErrorForStep, setStep, state.currentStep]);

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
                if (getValidationErrorForStep(step.id)) {
                    return false;
                }
            }

            return true;
        },
        [getValidationErrorForStep, state.currentStep]
    );

    const renderStep = (stepId: WizardStepId) => {
        switch (stepId) {
            case "program":
                return (
                    <ProgramStep
                        programsState={programsState}
                        selectedProgramId={state.selectedProgramId}
                        programDetailsState={programDetailsState}
                        selectedFileDataValueIds={state.selectedFileDataValueIds}
                        onSelectProgram={programId => setScope({ selectedProgramId: programId })}
                        onSelectFileDataValueIds={setSelectedFileDataValueIds}
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
                        selectedFileDataElements={selectedFileDataElements}
                        mappingByFileKey={state.mappingByFileKey}
                        quickPreviewState={quickPreviewState}
                        quickPreviewByFileKey={quickPreviewByFileKey}
                        onSelectOrgUnit={selection =>
                            setScope({
                                selectedOrgUnitId: selection.id,
                                selectedOrgUnitName: selection.name,
                            })
                        }
                        onSelectionModeChange={orgUnitSelectionMode =>
                            setScope({ orgUnitSelectionMode })
                        }
                        onDateFromChange={dateFrom => setScope({ dateFrom })}
                        onDateToChange={dateTo => setScope({ dateTo })}
                        onMappingChange={setFileMapping}
                        onRetryPreview={() => {
                            void reloadQuickPreview();
                        }}
                    />
                );
            case "preview":
                return (
                    <PreviewStep
                        selectedProgramName={selectedProgram?.name ?? state.selectedProgramId}
                        selectedProgramId={state.selectedProgramId}
                        selectedOrgUnitName={selectedOrgUnitName}
                        selectedOrgUnitId={state.selectedOrgUnitId}
                        orgUnitSelectionMode={state.orgUnitSelectionMode}
                        selectedFileMappings={selectedFileDataElements.map(fileProperty => ({
                            id: fileProperty.id,
                            name: fileProperty.name,
                            template: state.mappingByFileKey[fileProperty.id] ?? "",
                        }))}
                        exportConfigurationFileMappings={exportConfigurationFileMappings}
                        dateFrom={state.dateFrom}
                        dateTo={state.dateTo}
                        previewState={exportPreviewState}
                        filteredPreview={filteredExportPreview}
                        previewRows={exportPreviewRows}
                        previewSummary={exportPreviewSummary}
                        onRetry={() => {
                            void reloadExportPreview();
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
                    <Button primary onClick={onNext}>
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
    selectedFileDataValueIds: string[];
    onSelectProgram: (programId: string) => void;
    onSelectFileDataValueIds: (selectedFileDataValueIds: string[]) => void;
};

const ProgramStep: React.FC<ProgramStepProps> = ({
    programsState,
    selectedProgramId,
    programDetailsState,
    selectedFileDataValueIds,
    onSelectProgram,
    onSelectFileDataValueIds,
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

    const selectedIdSet = React.useMemo(() => {
        return new Set(selectedFileDataValueIds);
    }, [selectedFileDataValueIds]);

    const onToggleFileSelection = React.useCallback(
        (fileDataElementId: string) => {
            const nextSelection = selectedIdSet.has(fileDataElementId)
                ? selectedFileDataValueIds.filter(selectedId => selectedId !== fileDataElementId)
                : [...selectedFileDataValueIds, fileDataElementId];
            onSelectFileDataValueIds(nextSelection);
        },
        [onSelectFileDataValueIds, selectedFileDataValueIds, selectedIdSet]
    );

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

            <h4>{i18n.t("File data values to sync")}</h4>
            {!selectedProgramId ? (
                <NoticeBox title={i18n.t("Program required")}>
                    {i18n.t("Select a program to inspect file data values.")}
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
                            <th>{i18n.t("Sync")}</th>
                            <th>{i18n.t("Data element")}</th>
                            <th>{i18n.t("Value type")}</th>
                            <th>{i18n.t("Program stage")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fileDataElements.map(item => (
                            <tr key={item.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        data-testid={`wizard-file-select-${item.id}`}
                                        checked={selectedIdSet.has(item.id)}
                                        onChange={() => onToggleFileSelection(item.id)}
                                    />
                                </td>
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
    selectedFileDataElements: ProgramFileProperty[];
    mappingByFileKey: Record<string, string>;
    quickPreviewState: AsyncData<ProgramEventsPreviewResult>;
    quickPreviewByFileKey: Record<string, string[]>;
    onSelectOrgUnit: (selection: { id: string; name?: string }) => void;
    onSelectionModeChange: (mode: OrgUnitSelectionMode) => void;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onMappingChange: (fileKey: string, mapping: string) => void;
    onRetryPreview: () => void;
};

const TemplateStep: React.FC<TemplateStepProps> = ({
    selectedProgram,
    programDetailsState,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    dateFrom,
    dateTo,
    selectedFileDataElements,
    mappingByFileKey,
    quickPreviewState,
    quickPreviewByFileKey,
    onSelectOrgUnit,
    onSelectionModeChange,
    onDateFromChange,
    onDateToChange,
    onMappingChange,
    onRetryPreview,
}) => {
    const hasPreviewScope = Boolean(selectedProgram && selectedOrgUnitId);
    const selectedFileIdSet = React.useMemo(() => {
        return new Set(selectedFileDataElements.map(property => property.id));
    }, [selectedFileDataElements]);

    const templateInputRefs = React.useRef<Record<string, HTMLTextAreaElement | null>>({});

    const onInsertTemplateToken = React.useCallback(
        (fileKey: string, token: string) => {
            const input = templateInputRefs.current[fileKey];
            const currentValue = mappingByFileKey[fileKey] ?? "";
            const result = insertAtCursor(
                currentValue,
                token,
                input?.selectionStart,
                input?.selectionEnd
            );

            onMappingChange(fileKey, result.value);
            window.setTimeout(() => {
                const nextInput = templateInputRefs.current[fileKey];
                if (!nextInput) {
                    return;
                }
                nextInput.focus();
                nextInput.setSelectionRange(result.caret, result.caret);
            }, 0);
        },
        [mappingByFileKey, onMappingChange]
    );

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

            {selectedFileDataElements.length === 0 ? (
                <section className="wizard-section">
                    <NoticeBox title={i18n.t("No selected files")}>
                        {i18n.t("Go back to step 1 and select at least one file data value to sync.")}
                    </NoticeBox>
                </section>
            ) : (
                selectedFileDataElements.map((fileProperty, fileIndex) => {
                    const templateValue = mappingByFileKey[fileProperty.id] ?? "";
                    const templateError = validateTemplate(templateValue);
                    const resolvedTemplates = quickPreviewByFileKey[fileProperty.id] ?? [];
                    const visiblePropertyGroups =
                        programDetailsState.status === "success"
                            ? getVisiblePropertyGroupsForFile(
                                  programDetailsState.data.propertyGroups,
                                  selectedFileDataElements,
                                  fileProperty
                              )
                            : [];

                    return (
                        <section className="wizard-section" key={fileProperty.id}>
                            <h4>
                                {i18n.t("Path and filename template - {{name}}", {
                                    name: fileProperty.name,
                                })}
                            </h4>
                            <p>
                                {i18n.t(
                                    "Use tokens like {orgUnitName}, {enrollmentDate}, {attribute:NationalID}, {dataElement:FileName}."
                                )}
                            </p>
                            <div className="template-builder-grid">
                                <div className="template-editor-panel">
                                    <textarea
                                        ref={input => {
                                            templateInputRefs.current[fileProperty.id] = input;
                                        }}
                                        data-testid={
                                            fileIndex === 0
                                                ? "wizard-template-input"
                                                : `wizard-template-input-${fileProperty.id}`
                                        }
                                        rows={5}
                                        value={templateValue}
                                        onChange={event =>
                                            onMappingChange(fileProperty.id, event.target.value)
                                        }
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
                                      visiblePropertyGroups.length > 0 ? (
                                        <div className="template-property-groups" data-testid="wizard-property-groups">
                                            {visiblePropertyGroups.map(group => (
                                                <div key={group.id} className="template-property-group">
                                                    <p className="template-property-group-title">{group.name}</p>
                                                    <ul>
                                                        {group.properties.map(property => {
                                                            if (
                                                                group.id !== "fileMetadata" &&
                                                                property.sourceType === "dataElement" &&
                                                                FILE_VALUE_TYPES.has(property.valueType) &&
                                                                !selectedFileIdSet.has(property.id)
                                                            ) {
                                                                return null;
                                                            }
                                                            const token = getPropertyTemplateToken(property);
                                                            return (
                                                                <li key={`${group.id}:${property.sourceType}:${property.id}`}>
                                                                    <button
                                                                        type="button"
                                                                        className="template-token-button"
                                                                        data-testid={
                                                                            fileIndex === 0
                                                                                ? `wizard-token-${property.id}`
                                                                                : `wizard-token-${fileProperty.id}-${property.id}`
                                                                        }
                                                                        onClick={() =>
                                                                            onInsertTemplateToken(
                                                                                fileProperty.id,
                                                                                token
                                                                            )
                                                                        }
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
                                    <p>{i18n.t("Template syntax looks valid.")}</p>
                                    {!hasPreviewScope ? (
                                        <p>{i18n.t("Select program and organisation unit to load resolved values.")}</p>
                                    ) : quickPreviewState.status === "loading" ? (
                                        <CircularLoader small />
                                    ) : quickPreviewState.status === "error" ? (
                                        <span>
                                            {i18n.t("Could not load resolved values.")}{" "}
                                            <Button small onClick={onRetryPreview}>
                                                {i18n.t("Retry preview")}
                                            </Button>
                                        </span>
                                    ) : resolvedTemplates.length === 0 ? (
                                        <p>{i18n.t("No resolved template values found for current filters.")}</p>
                                    ) : (
                                        <ul data-testid={`wizard-resolved-template-list-${fileProperty.id}`}>
                                            {resolvedTemplates.map((resolvedTemplate, index) => (
                                                <li key={`${fileProperty.id}:${String(index)}`}>
                                                    {resolvedTemplate}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </NoticeBox>
                            )}
                        </section>
                    );
                })
            )}
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
    const hasRequiredValues = Boolean(url && username && password);
    const validateButtonLabel =
        connectionStatus === "validating"
            ? i18n.t("Testing connection...")
            : connectionStatus === "valid"
              ? i18n.t("Retest connection")
              : i18n.t("Test connection");

    return (
        <div className="wizard-step-content wizard-storage-step" aria-label="wizard-step-storage">
            <div className="wizard-storage-header">
                <div>
                    <h3>{i18n.t("Connect WebDAV storage")}</h3>
                    <p className="wizard-subtitle wizard-storage-subtitle">
                        {i18n.t("WebDAV is the only available export target for now.")}
                    </p>
                </div>
                <NoticeBox title={i18n.t("Compatible software")} dataTest="wizard-storage-compatible">
                    {i18n.t(
                        "You can use WebDAV-compatible storage such as ownCloud, Nextcloud, or another WebDAV-enabled server."
                    )}
                </NoticeBox>
            </div>

            <div className="wizard-storage-grid">
                <section className="wizard-section">
                    <h4>{i18n.t("Connection details")}</h4>
                    <p className="wizard-helper-text">
                        {i18n.t(
                            "Enter the WebDAV endpoint URL and credentials that the browser will use during export."
                        )}
                    </p>

                    <label className="field-label" htmlFor="wizard-storage-url">
                        {i18n.t("WebDAV URL")}
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

                    <div className="actions-row wizard-storage-actions">
                        <Button
                            disabled={!hasRequiredValues || connectionStatus === "validating"}
                            onClick={onValidate}
                        >
                            {validateButtonLabel}
                        </Button>
                        <span className="wizard-helper-text wizard-storage-action-hint">
                            {i18n.t("You must pass this test before continuing to execution.")}
                        </span>
                    </div>
                </section>

                <section className="wizard-section" data-testid="wizard-storage-remarks">
                    <h4>{i18n.t("Before you test")}</h4>
                    <ul className="wizard-storage-checklist">
                        <li>
                            {i18n.t(
                                "Use the direct WebDAV endpoint, not a generic product homepage or login page."
                            )}
                        </li>
                        <li>
                            {i18n.t(
                                "The WebDAV server must allow cross-origin requests from this app origin (CORS) or the browser will block validation and file transfer."
                            )}
                        </li>
                        <li>
                            {i18n.t(
                                "If your server sits behind a proxy or self-signed TLS setup, make sure the browser can reach it successfully from this environment."
                            )}
                        </li>
                    </ul>
                </section>
            </div>

            {!hasRequiredValues ? (
                <NoticeBox title={i18n.t("Complete the connection details")}>
                    {i18n.t("Enter the WebDAV URL, username, and password to enable connection testing.")}
                </NoticeBox>
            ) : null}
            {connectionStatus === "idle" && hasRequiredValues ? (
                <NoticeBox title={i18n.t("Ready to test")}>
                    {i18n.t("Run the connection test to confirm these WebDAV credentials work from the browser.")}
                </NoticeBox>
            ) : null}
            {connectionStatus === "validating" ? (
                <NoticeBox title={i18n.t("Testing connection")}>
                    <div className="wizard-inline-loader">
                        <CircularLoader small />
                        <span>
                            {i18n.t(
                                "Checking whether this browser can reach the WebDAV endpoint with the provided credentials."
                            )}
                        </span>
                    </div>
                </NoticeBox>
            ) : null}
            {connectionStatus === "valid" ? (
                <NoticeBox title={i18n.t("Connection valid")}>
                    {i18n.t("WebDAV connection validated. You can continue to execution.")}
                </NoticeBox>
            ) : null}
            {connectionError ? (
                <NoticeBox error title={i18n.t("Connection invalid")}>
                    {connectionError} {i18n.t("Review the setup remarks above and try again.")}
                </NoticeBox>
            ) : null}
        </div>
    );
};

type PreviewStepProps = {
    selectedProgramName: string;
    selectedProgramId: string;
    selectedOrgUnitName: string;
    selectedOrgUnitId: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    selectedFileMappings: Array<{
        id: string;
        name: string;
        template: string;
    }>;
    exportConfigurationFileMappings: ExportExecutionConfigurationFileMapping[];
    dateFrom: string;
    dateTo: string;
    previewState: AsyncData<ProgramEventsPreviewResult>;
    filteredPreview: ProgramEventPreview[];
    previewRows: ExportPreviewRow[];
    previewSummary: {
        totalFiles: number;
        totalSize: number;
        duplicateTargetPaths: string[];
        missingFileResourceCount: number;
    };
    onRetry: () => void;
};

const PreviewStep: React.FC<PreviewStepProps> = ({
    selectedProgramName,
    selectedProgramId,
    selectedOrgUnitName,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    selectedFileMappings,
    exportConfigurationFileMappings,
    dateFrom,
    dateTo,
    previewState,
    filteredPreview,
    previewRows,
    previewSummary,
    onRetry,
}) => {
    const hasScope = Boolean(selectedProgramId && selectedOrgUnitId);
    const [exportConfigStatus, setExportConfigStatus] = React.useState<"idle" | "downloaded">(
        "idle"
    );

    const onExportConfiguration = React.useCallback(() => {
        const generatedAt = new Date().toISOString();
        const configuration = buildExportExecutionConfiguration({
            generatedAt,
            selectedProgramId,
            selectedProgramName,
            selectedOrgUnitId,
            selectedOrgUnitName,
            orgUnitSelectionMode,
            dateFrom,
            dateTo,
            selectedFileMappings: exportConfigurationFileMappings,
            previewRows,
        });

        downloadExportExecutionConfiguration(
            configuration,
            buildExportExecutionConfigurationFilename(selectedProgramId, generatedAt)
        );
        setExportConfigStatus("downloaded");
    }, [
        dateFrom,
        dateTo,
        exportConfigurationFileMappings,
        orgUnitSelectionMode,
        previewRows,
        selectedOrgUnitId,
        selectedOrgUnitName,
        selectedProgramId,
        selectedProgramName,
    ]);

    return (
        <div className="wizard-step-content" aria-label="wizard-step-preview">
            <h3>{i18n.t("Preview files to export")}</h3>
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
                <>
                    <div
                        className="wizard-section wizard-preview-summary"
                        data-testid="wizard-preview-summary"
                    >
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Program")}</span>
                            <strong>{selectedProgramName}</strong>
                        </div>
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Selected file data elements")}</span>
                            <ul
                                className="wizard-preview-mapping-list"
                                data-testid="wizard-preview-file-mappings"
                            >
                                {selectedFileMappings.map(fileMapping => (
                                    <li key={fileMapping.id}>
                                        <strong>{fileMapping.name}</strong>
                                        <code>{fileMapping.template}</code>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Org unit")}</span>
                            <strong>{selectedOrgUnitName}</strong>
                        </div>
                        <div className="wizard-preview-summary-item">
                            <span>{i18n.t("Org unit mode")}</span>
                            <strong>
                                {orgUnitSelectionMode === "selected"
                                    ? i18n.t("Selected")
                                    : i18n.t("Descendants")}
                            </strong>
                        </div>
                    </div>
                    <p>
                        {i18n.t("Preview the resolved export rows before continuing.")}
                    </p>
                    {previewRows.length === 0 ? (
                        <NoticeBox title={i18n.t("No files found")}>
                            {dateFrom || dateTo
                                ? i18n.t("No exportable files match the selected date filters.")
                                : i18n.t("No exportable files match the current selection.")}
                        </NoticeBox>
                    ) : (
                        <div className="wizard-preview-table-wrap">
                            <table className="preview-table wizard-preview-table" data-testid="wizard-preview-table">
                                <thead>
                                    <tr>
                                        <th>{i18n.t("Event")}</th>
                                        <th>{i18n.t("File data value")}</th>
                                        <th>{i18n.t("Source filename")}</th>
                                        <th>{i18n.t("Size")}</th>
                                        <th>{i18n.t("Target")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map(row => {
                                        const warning = getPreviewFileWarning(row);

                                        return (
                                            <tr
                                                key={row.id}
                                                data-testid={`wizard-preview-row-${row.id}`}
                                                className={[
                                                    row.hasDuplicateTargetPath
                                                        ? "wizard-preview-row-duplicate"
                                                        : "",
                                                    row.isMissingFileResource
                                                        ? "wizard-preview-row-warning"
                                                        : "",
                                                ]
                                                    .filter(Boolean)
                                                    .join(" ")}
                                            >
                                                <td>
                                                    <a
                                                        className="wizard-preview-event-link"
                                                        href={buildCaptureEventUrl(
                                                            row.eventId,
                                                            row.eventOrgUnitId
                                                        )}
                                                        rel="noopener noreferrer"
                                                        target="_blank"
                                                    >
                                                        {row.eventId}
                                                    </a>
                                                </td>
                                                <td>
                                                    <div className="wizard-preview-cell-primary">
                                                        {row.fileDataValueName}
                                                    </div>
                                                    <div className="wizard-preview-cell-secondary">
                                                        {row.eventOrgUnitName}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="wizard-preview-cell-primary">
                                                        {getPreviewCellValue(row.fileName)}
                                                    </div>
                                                    {warning ? (
                                                        <div className="wizard-preview-warning-text">
                                                            {warning}
                                                        </div>
                                                    ) : null}
                                                </td>
                                                <td>{formatFileSize(row.fileSize)}</td>
                                                <td>{getPreviewCellValue(row.resolvedTargetPath)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div className="wizard-preview-footer" data-testid="wizard-preview-footer">
                        {previewSummary.duplicateTargetPaths.length > 0 ? (
                            <NoticeBox
                                warning
                                title={i18n.t("Duplicate target filepaths detected")}
                                dataTest="wizard-preview-duplicate-error"
                            >
                                {i18n.t(
                                    "Revise the template. {{count}} target filepath conflicts were found.",
                                    {
                                        count: String(previewSummary.duplicateTargetPaths.length),
                                    }
                                )}
                            </NoticeBox>
                        ) : null}
                        {previewSummary.missingFileResourceCount > 0 ? (
                            <NoticeBox warning title={i18n.t("Files will be skipped")}>
                                {i18n.t(
                                    "{{count}} files without FileResource won't be exported.",
                                    {
                                        count: String(previewSummary.missingFileResourceCount),
                                    }
                                )}
                            </NoticeBox>
                        ) : null}
                        <div className="wizard-preview-footer-meta">
                            <p className="wizard-preview-meta-text">
                                {i18n.t("Matching events: {{total}}. Pages: {{pages}}.", {
                                    total: String(previewState.data.total ?? filteredPreview.length),
                                    pages: String(previewState.data.pageCount ?? 1),
                                })}
                            </p>
                            <div className="wizard-preview-stats" data-testid="wizard-preview-stats">
                                <div className="wizard-preview-stat">
                                    <span>{i18n.t("Files")}</span>
                                    <strong>{String(previewSummary.totalFiles)}</strong>
                                </div>
                                <div className="wizard-preview-stat">
                                    <span>{i18n.t("Total size")}</span>
                                    <strong>{formatFileSize(previewSummary.totalSize)}</strong>
                                </div>
                            </div>
                            <div className="actions-row wizard-preview-actions">
                                <Button
                                    secondary
                                    data-testid="wizard-export-config-button"
                                    onClick={onExportConfiguration}
                                >
                                    {i18n.t("Export configuration")}
                                </Button>
                            </div>
                            <p className="wizard-preview-meta-text">
                                {i18n.t(
                                    "Download a JSON execution configuration for the current reviewed preview."
                                )}
                            </p>
                            {exportConfigStatus === "downloaded" ? (
                                <NoticeBox title={i18n.t("Execution configuration downloaded")}>
                                    {i18n.t(
                                        "The JSON execution configuration for this preview was downloaded."
                                    )}
                                </NoticeBox>
                            ) : null}
                        </div>
                    </div>
                </>
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
