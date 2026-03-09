import React from "react";
import { EventPreview } from "$/webapp/pages/landing/components/EventPreview";
import { ProgramDetails } from "$/webapp/pages/landing/components/ProgramDetails";
import { ProgramPicker } from "$/webapp/pages/landing/components/ProgramPicker";
import { useFileCapablePrograms } from "$/webapp/pages/landing/hooks/useFileCapablePrograms";
import { useProgramEventsPreview } from "$/webapp/pages/landing/hooks/useProgramEventsPreview";
import { useProgramFileProperties } from "$/webapp/pages/landing/hooks/useProgramFileProperties";
import i18n from "$/utils/i18n";
import "./LandingPage.css";

export const LandingPage: React.FC = React.memo(() => {
    const [selectedProgramId, setSelectedProgramId] = React.useState("");
    const [selectedOrgUnitId, setSelectedOrgUnitId] = React.useState("");

    const { state: programsState, reload: reloadPrograms } = useFileCapablePrograms();
    const { state: programDetailsState } = useProgramFileProperties(selectedProgramId);
    const { state: previewState, reload: reloadPreview } = useProgramEventsPreview(
        selectedProgramId,
        selectedOrgUnitId
    );

    const programOrgUnits = React.useMemo(() => {
        if (programsState.status !== "success") {
            return [];
        }

        return (
            programsState.data.find(program => program.id === selectedProgramId)
                ?.organisationUnits ?? []
        );
    }, [programsState, selectedProgramId]);

    return (
        <div className="landing-page">
            <h2>{i18n.t("File Export Program Picker")}</h2>
            <ProgramPicker
                programsState={programsState}
                selectedProgramId={selectedProgramId}
                onSelectProgram={programId => {
                    setSelectedProgramId(programId);
                    setSelectedOrgUnitId("");
                }}
                onReloadPrograms={() => {
                    void reloadPrograms();
                }}
            />
            <ProgramDetails
                selectedProgramId={selectedProgramId}
                programDetailsState={programDetailsState}
            />
            <EventPreview
                programOrgUnits={programOrgUnits}
                selectedProgramId={selectedProgramId}
                selectedOrgUnitId={selectedOrgUnitId}
                onSelectOrgUnit={selection => setSelectedOrgUnitId(selection.id)}
                previewState={previewState}
                onRetryPreview={() => {
                    void reloadPreview();
                }}
            />
        </div>
    );
});
