import React from "react";
import { useAppContext } from "$/webapp/contexts/app-context";
import { WizardShell } from "$/webapp/pages/wizard/components/WizardShell";
import { useWizardExecutionController } from "$/webapp/pages/wizard/hooks/useWizardExecutionController";
import { useWizardPreviewData } from "$/webapp/pages/wizard/hooks/useWizardPreviewData";
import { useWizardProgramData } from "$/webapp/pages/wizard/hooks/useWizardProgramData";
import { useWizardTemplatePreviewData } from "$/webapp/pages/wizard/hooks/useWizardTemplatePreviewData";
import { ExecutionStep } from "$/webapp/pages/wizard/steps/ExecutionStep";
import { PreviewStep } from "$/webapp/pages/wizard/steps/PreviewStep";
import { ProgramStep } from "$/webapp/pages/wizard/steps/ProgramStep";
import { StorageStep } from "$/webapp/pages/wizard/steps/StorageStep";
import { TemplateStep } from "$/webapp/pages/wizard/steps/TemplateStep";
import { useWizardContext } from "$/webapp/pages/wizard/WizardContext";
import {
    getStepValidationError,
    WizardStepId,
    WIZARD_STEPS,
} from "$/webapp/pages/wizard/wizardConfig";

export const WizardContent: React.FC = () => {
    const { baseUrl, compositionRoot, dhis2Version } = useAppContext();
    const {
        state,
        currentStepId,
        setScope,
        setStorage,
        validateStorageConnection,
        setSelectedFileDataValueIds,
        setFileMapping,
        setStep,
        goBack,
        setExecution,
    } = useWizardContext();

    const {
        programsState,
        programDetailsState,
        organisationUnitsState,
        selectedProgram,
        selectedFileDataElements,
        selectedFilePropertyById,
    } = useWizardProgramData({
        selectedProgramId: state.selectedProgramId,
        selectedFileDataValueIds: state.selectedFileDataValueIds,
        onNormalizeSelectedFileDataValueIds: setSelectedFileDataValueIds,
    });

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

    const {
        previewEnabled,
        quickPreviewState,
        quickPreviewByFileKey,
        reloadQuickPreview,
    } = useWizardTemplatePreviewData({
        currentStepId,
        selectedProgramId: state.selectedProgramId,
        selectedOrgUnitId: state.selectedOrgUnitId,
        orgUnitSelectionMode: state.orgUnitSelectionMode,
        selectedFileDataValueIds: state.selectedFileDataValueIds,
        selectedFileDataElements,
        selectedFilePropertyById,
        mappingByFileKey: state.mappingByFileKey,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
    });

    const {
        exportPreviewState,
        reloadExportPreview,
        exportPreviewRows,
        exportPreviewSummary,
        exportConfigurationFileMappings,
        selectedOrgUnitName,
        executionConfiguration,
    } = useWizardPreviewData({
        baseUrl,
        dhis2Version,
        previewEnabled,
        selectedProgramId: state.selectedProgramId,
        selectedProgram,
        selectedOrgUnitId: state.selectedOrgUnitId,
        selectedOrgUnitName: state.selectedOrgUnitName,
        orgUnitSelectionMode: state.orgUnitSelectionMode,
        dateFrom: state.dateFrom,
        dateTo: state.dateTo,
        mappingByFileKey: state.mappingByFileKey,
        selectedFileDataElements,
        organisationUnitsState,
        quickPreviewState,
    });

    const {
        onRunExecution,
        onInterruptExecution,
        onDownloadExecutionReport,
    } = useWizardExecutionController({
        compositionRoot,
        executionConfiguration,
        storage: state.storage,
        executionState: state.execution,
        setExecution,
    });

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
    const isExecutionRunning = state.execution.status === "running";

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
                if (!step) {
                    return false;
                }
                if (getValidationErrorForStep(step.id)) {
                    return false;
                }
            }

            return true;
        },
        [getValidationErrorForStep, isExecutionRunning, state.currentStep]
    );

    const renderStep = () => {
        switch (currentStepId) {
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
                        onInterrupt={onInterruptExecution}
                        onDownloadReport={onDownloadExecutionReport}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <WizardShell
            currentStep={state.currentStep}
            steps={WIZARD_STEPS}
            currentStepError={currentStepError}
            isExecutionRunning={isExecutionRunning}
            canNavigateToStep={canNavigateToStep}
            onSetStep={setStep}
            onBack={goBack}
            onNext={onNext}
            onFinish={() => undefined}
        >
            {renderStep()}
        </WizardShell>
    );
};
