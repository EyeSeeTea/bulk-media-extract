import React from "react";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { useWizardExportPreview } from "$/webapp/pages/wizard/hooks/useWizardExportPreview";
import { resolveTemplateForEvent } from "$/application/export/TemplateBuilder";
import { filterEventsByDate } from "$/webapp/pages/wizard/wizardShared";
import { validateTemplate, WizardStepId } from "$/webapp/pages/wizard/wizardConfig";

type UseWizardTemplatePreviewDataParams = {
    currentStepId: WizardStepId;
    selectedProgramId: string;
    selectedOrgUnitId: string;
    orgUnitSelectionMode: "selected" | "descendants";
    selectedFileDataValueIds: string[];
    selectedFileDataElements: ProgramFileProperty[];
    selectedFilePropertyById: Record<string, ProgramFileProperty>;
    mappingByFileKey: Record<string, string>;
    dateFrom: string;
    dateTo: string;
};

export function useWizardTemplatePreviewData({
    currentStepId,
    selectedProgramId,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    selectedFileDataValueIds,
    selectedFileDataElements,
    selectedFilePropertyById,
    mappingByFileKey,
    dateFrom,
    dateTo,
}: UseWizardTemplatePreviewDataParams) {
    const firstSelectedTemplate = selectedFileDataValueIds[0]
        ? mappingByFileKey[selectedFileDataValueIds[0]] ?? ""
        : "";
    const isTemplateValid = !validateTemplate(firstSelectedTemplate);
    const previewEnabled =
        currentStepId === "preview" || currentStepId === "storage" || currentStepId === "execution";
    const canPreviewFromTemplateStep = Boolean(
        currentStepId === "template" && selectedProgramId && selectedOrgUnitId && isTemplateValid
    );

    const selectedFileFilters = React.useMemo(
        () =>
            selectedFileDataElements.map(fileProperty => ({
                fileDataElementId: fileProperty.id,
                programStageId: fileProperty.sourceContainerId,
            })),
        [selectedFileDataElements]
    );

    const { state: quickPreviewState, reload: reloadQuickPreview } = useWizardExportPreview({
        programId: selectedProgramId,
        orgUnitId: selectedOrgUnitId,
        orgUnitMode: orgUnitSelectionMode,
        selectedFileFilters,
        options: {
            enabled: previewEnabled || canPreviewFromTemplateStep,
        },
    });

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

        return filterEventsByDate(quickPreviewState.data.events, dateFrom, dateTo);
    }, [dateFrom, dateTo, quickPreviewState]);

    const quickPreviewByFileKey = React.useMemo<Record<string, string[]>>(() => {
        return selectedFileDataValueIds.reduce<Record<string, string[]>>((acc, fileKey) => {
            const template = mappingByFileKey[fileKey] ?? "";
            const selectedFileProperty = selectedFilePropertyById[fileKey];
            if (!template || validateTemplate(template)) {
                acc[fileKey] = [];
                return acc;
            }

            acc[fileKey] = quickPreviewEvents
                .filter(event => {
                    if (!selectedFileProperty) {
                        return true;
                    }

                    return Boolean(event.fileNames[selectedFileProperty.id]);
                })
                .slice(0, 10)
                .map(event => resolveTemplateForEvent(template, event, selectedFileProperty))
                .filter(value => Boolean(value));
            return acc;
        }, {});
    }, [mappingByFileKey, quickPreviewEvents, selectedFileDataValueIds, selectedFilePropertyById]);

    return {
        previewEnabled,
        quickPreviewState,
        quickPreviewByFileKey,
        reloadQuickPreview,
    };
}
