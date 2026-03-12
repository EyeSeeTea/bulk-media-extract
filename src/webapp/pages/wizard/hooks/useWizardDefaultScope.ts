import React from "react";
import { ProgramOption } from "$/webapp/pages/wizard/wizardShared";
import { WizardState } from "$/webapp/pages/wizard/wizardConfig";

type UseWizardDefaultScopeParams = {
    selectedProgram?: ProgramOption;
    selectedOrgUnitId: string;
    setScope: (
        values: Partial<
            Pick<WizardState, "selectedOrgUnitId" | "orgUnitSelectionMode">
        >
    ) => void;
};

export function useWizardDefaultScope({
    selectedProgram,
    selectedOrgUnitId,
    setScope,
}: UseWizardDefaultScopeParams): void {
    React.useEffect(() => {
        if (!selectedProgram || selectedOrgUnitId) {
            return;
        }

        const firstRootOrgUnitId = selectedProgram.organisationUnits[0]?.id;
        if (firstRootOrgUnitId) {
            setScope({
                selectedOrgUnitId: firstRootOrgUnitId,
                orgUnitSelectionMode: "descendants",
            });
        }
    }, [selectedOrgUnitId, selectedProgram, setScope]);
}
