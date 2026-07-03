import React from "react";
import { useHistory } from "react-router-dom";
import { Button, Modal, ModalTitle, ModalContent, ModalActions } from "@dhis2/ui";
import i18n from "$/utils/i18n";
import { useAppContext } from "$/webapp/contexts/app-context";
import { PageHeader } from "$/webapp/components/page-header/PageHeader";
import { WizardShell } from "$/webapp/components/wizard/WizardShell";
import { useWizardDefaultScope } from "$/webapp/pages/wizard/hooks/useWizardDefaultScope";
import { useWizardExecutionController } from "$/webapp/pages/wizard/hooks/useWizardExecutionController";
import { useWizardPreviewData } from "$/webapp/pages/wizard/hooks/useWizardPreviewData";
import { useWizardProgramData } from "$/webapp/pages/wizard/hooks/useWizardProgramData";
import { useWizardStepController } from "$/webapp/pages/wizard/hooks/useWizardStepController";
import { useWizardTemplatePreviewData } from "$/webapp/pages/wizard/hooks/useWizardTemplatePreviewData";
import { ExecutionStep } from "$/webapp/pages/wizard/steps/ExecutionStep";
import { PreviewStep } from "$/webapp/pages/wizard/steps/PreviewStep";
import { ProgramStep } from "$/webapp/pages/wizard/steps/ProgramStep";
import { StorageStep } from "$/webapp/pages/wizard/steps/StorageStep";
import { TemplateStep } from "$/webapp/pages/wizard/steps/TemplateStep";
import { useWizardContext } from "$/webapp/pages/wizard/WizardContext";
import { WIZARD_STEPS } from "$/webapp/pages/wizard/wizardConfig";

export const WizardContent: React.FC = () => {
    const history = useHistory();
    const [showExitModal, setShowExitModal] = React.useState(false);
    const { baseUrl, compositionRoot, dhis2Version } = useAppContext();
    const {
        state,
        currentStepId,
        setScope,
        setStorageMethod,
        setWebDAVStorage,
        validateWebDAVConnection,
        chooseLocalDirectory,
        validateLocalDirectory,
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

    useWizardDefaultScope({
        selectedProgram,
        selectedOrgUnitId: state.selectedOrgUnitId,
        setScope,
    });

    const { previewEnabled, quickPreviewState, quickPreviewByFileKey, reloadQuickPreview } =
        useWizardTemplatePreviewData({
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

    const { onRunExecution, onInterruptExecution, onDownloadExecutionReport } =
        useWizardExecutionController({
            compositionRoot,
            executionConfiguration,
            storage: state.storage,
            executionState: state.execution,
            setExecution,
        });

    const {
        currentStepError,
        currentStepHasInlineNotice,
        isExecutionRunning,
        onNext,
        canNavigateToStep,
    } = useWizardStepController({
        state,
        currentStepId,
        exportPreviewState,
        duplicateTargetPathCount: exportPreviewSummary.duplicateTargetPathDetails.length,
        setStep,
    });

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
                            id: fileProperty.key,
                            name: fileProperty.name,
                            template: state.mappingByFileKey[fileProperty.key] ?? "",
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
                        selectedMethod={state.storage.selectedMethod}
                        webdav={state.storage.webdav}
                        localDirectory={state.storage.localDirectory}
                        onMethodChange={setStorageMethod}
                        onUrlChange={url => setWebDAVStorage({ url })}
                        onUsernameChange={username => setWebDAVStorage({ username })}
                        onPasswordChange={password => setWebDAVStorage({ password })}
                        onValidateWebDAV={() => {
                            void validateWebDAVConnection();
                        }}
                        onChooseLocalDirectory={() => {
                            void chooseLocalDirectory();
                        }}
                        onValidateLocalDirectory={() => {
                            void validateLocalDirectory();
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
        <>
            <PageHeader
                title={i18n.t("Export program files")}
                onBackClick={isExecutionRunning ? undefined : () => setShowExitModal(true)}
            />

            <WizardShell
                currentStep={state.currentStep}
                steps={WIZARD_STEPS}
                currentStepError={currentStepError}
                currentStepHasInlineNotice={currentStepHasInlineNotice}
                isExecutionRunning={isExecutionRunning}
                canNavigateToStep={canNavigateToStep}
                onSetStep={setStep}
                onBack={goBack}
                onNext={onNext}
                onFinish={() => history.push("/")}
            >
                {renderStep()}
            </WizardShell>

            {showExitModal && (
                <Modal position="middle" onClose={() => setShowExitModal(false)}>
                    <ModalTitle>{i18n.t("Exit current export")}</ModalTitle>
                    <ModalContent>
                        {i18n.t(
                            "All configuration entered in this export session will be lost. This action cannot be undone."
                        )}
                    </ModalContent>
                    <ModalActions>
                        <div className="wizard-modal-actions">
                            <Button secondary onClick={() => setShowExitModal(false)}>
                                {i18n.t("Continue editing")}
                            </Button>
                            <Button destructive onClick={() => history.push("/")}>
                                {i18n.t("Exit export")}
                            </Button>
                        </div>
                    </ModalActions>
                </Modal>
            )}
        </>
    );
};
