import React from "react";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { Dhis2Version } from "$/webapp/utils/dhis2Version";
import {
    buildExportExecutionConfiguration,
    ExportExecutionConfigurationFileMapping,
} from "$/application/export/ExecutionConfigurationBuilder";
import {
    buildExportPreviewRows,
    ExportPreviewRow,
    summarizeExportPreview,
} from "$/application/export/PreviewBuilder";
import { useWizardExportPreview } from "$/webapp/pages/wizard/hooks/useWizardExportPreview";
import { filterEventsByDate, ProgramOption } from "$/webapp/pages/wizard/wizardShared";

type UseWizardPreviewDataParams = {
    baseUrl: string;
    dhis2Version: Dhis2Version;
    previewEnabled: boolean;
    selectedProgramId: string;
    selectedProgram?: ProgramOption;
    selectedOrgUnitId: string;
    selectedOrgUnitName?: string;
    orgUnitSelectionMode: "selected" | "descendants";
    dateFrom: string;
    dateTo: string;
    mappingByFileKey: Record<string, string>;
    selectedFileDataElements: ProgramFileProperty[];
    organisationUnitsState: AsyncData<Array<{ id: string; name: string }>>;
    quickPreviewState: AsyncData<ProgramEventsPreviewResult>;
};

export function useWizardPreviewData({
    baseUrl,
    dhis2Version,
    previewEnabled,
    selectedProgramId,
    selectedProgram,
    selectedOrgUnitId,
    selectedOrgUnitName: persistedSelectedOrgUnitName,
    orgUnitSelectionMode,
    dateFrom,
    dateTo,
    mappingByFileKey,
    selectedFileDataElements,
    organisationUnitsState,
    quickPreviewState,
}: UseWizardPreviewDataParams) {
    const { state: exportPreviewState, reload: reloadExportPreview } = useWizardExportPreview({
        programId: selectedProgramId,
        orgUnitId: selectedOrgUnitId,
        orgUnitMode: orgUnitSelectionMode,
        selectedFileFilters: selectedFileDataElements.map(fileProperty => ({
            fileDataElementId: fileProperty.id,
            programStageId: fileProperty.sourceContainerId,
        })),
        options: {
            enabled: previewEnabled,
            pageSize: 100,
        },
    });

    React.useEffect(() => {
        if (!previewEnabled) {
            return;
        }
        if (exportPreviewState.status !== "idle") {
            return;
        }
        void reloadExportPreview();
    }, [exportPreviewState.status, previewEnabled, reloadExportPreview]);

    const filteredExportPreview = React.useMemo(() => {
        if (exportPreviewState.status !== "success") {
            return [];
        }

        return filterEventsByDate(exportPreviewState.data.events, dateFrom, dateTo);
    }, [dateFrom, dateTo, exportPreviewState]);

    const exportPreviewRows = React.useMemo<ExportPreviewRow[]>(() => {
        return buildExportPreviewRows(
            filteredExportPreview,
            selectedFileDataElements,
            mappingByFileKey,
            baseUrl,
            dhis2Version
        );
    }, [baseUrl, dhis2Version, filteredExportPreview, mappingByFileKey, selectedFileDataElements]);

    const exportPreviewSummary = React.useMemo(() => {
        return summarizeExportPreview(exportPreviewRows);
    }, [exportPreviewRows]);

    const exportConfigurationFileMappings = React.useMemo<
        ExportExecutionConfigurationFileMapping[]
    >(() => {
        return selectedFileDataElements.map(fileProperty => ({
            id: fileProperty.id,
            name: fileProperty.name,
            template: mappingByFileKey[fileProperty.id] ?? "",
            programStageId: fileProperty.sourceContainerId,
            programStageName: fileProperty.sourceContainerName,
        }));
    }, [mappingByFileKey, selectedFileDataElements]);

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
            persistedSelectedOrgUnitName ||
            availableOrgUnits.find(orgUnit => orgUnit.id === selectedOrgUnitId)?.name;
        const selectedOrgUnitNameFromPreview = previewEvents.find(
            event => event.orgUnitId === selectedOrgUnitId
        )?.orgUnitName;
        const selectedOrgUnitNameFromProgram = selectedProgram?.organisationUnits.find(
            orgUnit => orgUnit.id === selectedOrgUnitId
        )?.name;

        return (
            selectedOrgUnitNameFromStateOrList ??
            selectedOrgUnitNameFromPreview ??
            selectedOrgUnitNameFromProgram ??
            selectedOrgUnitId
        );
    }, [
        exportPreviewState,
        organisationUnitsState,
        persistedSelectedOrgUnitName,
        quickPreviewState,
        selectedOrgUnitId,
        selectedProgram,
    ]);

    const executionConfiguration = React.useMemo(() => {
        return buildExportExecutionConfiguration({
            selectedProgramId,
            selectedProgramName: selectedProgram?.name ?? selectedProgramId,
            selectedOrgUnitId,
            selectedOrgUnitName,
            orgUnitSelectionMode,
            dateFrom,
            dateTo,
            selectedFileMappings: exportConfigurationFileMappings,
            previewRows: exportPreviewRows,
        });
    }, [
        dateFrom,
        dateTo,
        exportConfigurationFileMappings,
        exportPreviewRows,
        orgUnitSelectionMode,
        selectedOrgUnitId,
        selectedOrgUnitName,
        selectedProgram,
        selectedProgramId,
    ]);

    return {
        exportPreviewState,
        reloadExportPreview,
        exportPreviewRows,
        exportPreviewSummary,
        exportConfigurationFileMappings,
        selectedOrgUnitName,
        executionConfiguration,
    };
}
