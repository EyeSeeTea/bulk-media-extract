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

function findRootOrgUnitId(orgUnits: ProgramOption["organisationUnits"]): string | undefined {
    const withPaths = orgUnits.filter(ou => ou.path);
    if (withPaths.length === 0) return orgUnits[0]?.id;

    const shortest = withPaths.reduce((a, b) =>
        (a.path?.length ?? Infinity) <= (b.path?.length ?? Infinity) ? a : b
    );

    return shortest.path
        ? shortest.path.split("/").filter(Boolean)[0]
        : orgUnits[0]?.id;
}

export function useWizardDefaultScope({
    selectedProgram,
    selectedOrgUnitId,
    setScope,
}: UseWizardDefaultScopeParams): void {
    React.useEffect(() => {
        if (!selectedProgram || selectedOrgUnitId) {
            return;
        }

        const firstRootOrgUnitId = findRootOrgUnitId(selectedProgram.organisationUnits);
        if (firstRootOrgUnitId) {
            setScope({
                selectedOrgUnitId: firstRootOrgUnitId,
                orgUnitSelectionMode: "descendants",
            });
        }
    }, [selectedOrgUnitId, selectedProgram, setScope]);
}
