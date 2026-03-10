import React from "react";
import { ProgramFileProperty } from "$/domain/entities/FileExportProgram";
import { useProgramEventsPreview } from "$/webapp/pages/landing/hooks/useProgramEventsPreview";
import { resolveTemplateForEvent } from "$/webapp/pages/wizard/templateBuilder";
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
    const previewProgramStageId = selectedFileDataElements[0]?.sourceContainerId;
    const previewFileDataElementId = selectedFileDataElements[0]?.id;
    const firstSelectedTemplate = selectedFileDataValueIds[0]
        ? mappingByFileKey[selectedFileDataValueIds[0]] ?? ""
        : "";
    const isTemplateValid = !validateTemplate(firstSelectedTemplate);
    const previewEnabled =
        currentStepId === "preview" || currentStepId === "storage" || currentStepId === "execution";
    const canPreviewFromTemplateStep = Boolean(
        currentStepId === "template" && selectedProgramId && selectedOrgUnitId && isTemplateValid
    );

    const { state: quickPreviewState, reload: reloadQuickPreview } = useProgramEventsPreview(
        selectedProgramId,
        selectedOrgUnitId,
        orgUnitSelectionMode,
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

        return filterEventsByDate(quickPreviewState.data.events, dateFrom, dateTo);
    }, [dateFrom, dateTo, quickPreviewState]);

    const quickPreviewByFileKey = React.useMemo<Record<string, string[]>>(() => {
        const previewSource = quickPreviewEvents.slice(0, 10);
        return selectedFileDataValueIds.reduce<Record<string, string[]>>((acc, fileKey) => {
            const template = mappingByFileKey[fileKey] ?? "";
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
        mappingByFileKey,
        quickPreviewEvents,
        selectedFileDataValueIds,
        selectedFilePropertyById,
    ]);

    return {
        previewEnabled,
        quickPreviewState,
        quickPreviewByFileKey,
        reloadQuickPreview,
    };
}
