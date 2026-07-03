import React from "react";
import { useOrganisationUnits } from "$/webapp/pages/landing/hooks/useOrganisationUnits";
import { useFileCapablePrograms } from "$/webapp/pages/landing/hooks/useFileCapablePrograms";
import { useProgramFileProperties } from "$/webapp/pages/landing/hooks/useProgramFileProperties";
import { FILE_VALUE_TYPES } from "$/webapp/pages/wizard/wizardShared";

type UseWizardProgramDataParams = {
    selectedProgramId: string;
    selectedFileDataValueIds: string[];
    onNormalizeSelectedFileDataValueIds: (selectedFileDataValueIds: string[]) => void;
};

export function useWizardProgramData({
    selectedProgramId,
    selectedFileDataValueIds,
    onNormalizeSelectedFileDataValueIds,
}: UseWizardProgramDataParams) {
    const { state: programsState } = useFileCapablePrograms();
    const { state: programDetailsState } = useProgramFileProperties(selectedProgramId);
    const { state: organisationUnitsState } = useOrganisationUnits();

    const selectedProgram = React.useMemo(() => {
        if (programsState.status !== "success") {
            return undefined;
        }
        return programsState.data.find(program => program.id === selectedProgramId);
    }, [programsState, selectedProgramId]);

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
        const selectedIdSet = new Set(selectedFileDataValueIds);
        return selectableFileDataElements.filter(property => selectedIdSet.has(property.key));
    }, [selectableFileDataElements, selectedFileDataValueIds]);

    const selectedFilePropertyById = React.useMemo(() => {
        return Object.fromEntries(
            selectedFileDataElements.map(fileProperty => [fileProperty.key, fileProperty])
        );
    }, [selectedFileDataElements]);

    React.useEffect(() => {
        if (programDetailsState.status !== "success") {
            return;
        }

        const selectableIdSet = new Set(selectableFileDataElements.map(property => property.key));
        const normalizedSelection = selectedFileDataValueIds.filter(fileKey =>
            selectableIdSet.has(fileKey)
        );
        if (normalizedSelection.length !== selectedFileDataValueIds.length) {
            onNormalizeSelectedFileDataValueIds(normalizedSelection);
        }
    }, [
        onNormalizeSelectedFileDataValueIds,
        programDetailsState.status,
        selectableFileDataElements,
        selectedFileDataValueIds,
    ]);

    return {
        programsState,
        programDetailsState,
        organisationUnitsState,
        selectedProgram,
        selectableFileDataElements,
        selectedFileDataElements,
        selectedFilePropertyById,
    };
}
