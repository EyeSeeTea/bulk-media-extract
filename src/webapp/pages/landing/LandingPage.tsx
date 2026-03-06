import React from "react";
import { EventPreview } from "$/webapp/pages/landing/components/EventPreview";
import { ProgramDetails } from "$/webapp/pages/landing/components/ProgramDetails";
import { ProgramPicker } from "$/webapp/pages/landing/components/ProgramPicker";
import { useFileCapablePrograms } from "$/webapp/pages/landing/hooks/useFileCapablePrograms";
import { useOrganisationUnits } from "$/webapp/pages/landing/hooks/useOrganisationUnits";
import { useProgramEventsPreview } from "$/webapp/pages/landing/hooks/useProgramEventsPreview";
import { useProgramFileProperties } from "$/webapp/pages/landing/hooks/useProgramFileProperties";
import i18n from "$/utils/i18n";
import "./LandingPage.css";

export const LandingPage: React.FC = React.memo(() => {
    const [selectedProgramId, setSelectedProgramId] = React.useState("");
    const [selectedOrgUnitId, setSelectedOrgUnitId] = React.useState("");

    const { state: programsState, reload: reloadPrograms } = useFileCapablePrograms();
    const { state: orgUnitsState } = useOrganisationUnits();
    const { state: programDetailsState } = useProgramFileProperties(selectedProgramId);
    const { state: previewState, reload: reloadPreview } = useProgramEventsPreview(
        selectedProgramId,
        selectedOrgUnitId
    );

    return (
        <div className="landing-page">
            <h2>{i18n.t("File Export Program Picker")}</h2>
            <ProgramPicker
                programsState={programsState}
                selectedProgramId={selectedProgramId}
                onSelectProgram={setSelectedProgramId}
                onReloadPrograms={() => {
                    void reloadPrograms();
                }}
            />
            <ProgramDetails
                selectedProgramId={selectedProgramId}
                programDetailsState={programDetailsState}
            />
            <EventPreview
                orgUnitsState={orgUnitsState}
                selectedProgramId={selectedProgramId}
                selectedOrgUnitId={selectedOrgUnitId}
                onSelectOrgUnit={setSelectedOrgUnitId}
                previewState={previewState}
                onRetryPreview={() => {
                    void reloadPreview();
                }}
            />
        </div>
    );
});
