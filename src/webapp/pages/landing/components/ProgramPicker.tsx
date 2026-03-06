import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import i18n from "$/utils/i18n";

type ProgramOption = { id: string; name: string };

type Props = {
    programsState: AsyncData<ProgramOption[]>;
    selectedProgramId: string;
    onSelectProgram: (programId: string) => void;
    onReloadPrograms: () => void;
};

/**
 * Renders the program selection panel and reload action.
 */
export const ProgramPicker: React.FC<Props> = React.memo(
    ({ programsState, selectedProgramId, onSelectProgram, onReloadPrograms }) => {
        return (
            <section className="panel" aria-label="program-picker">
                <h3>{i18n.t("Program")}</h3>
                {programsState.status === "loading" && <CircularLoader small />}
                {programsState.status === "error" && (
                    <NoticeBox error title={i18n.t("Could not load programs")}>
                        {programsState.error}
                    </NoticeBox>
                )}
                {programsState.status === "success" && (
                    <label className="field-label">
                        {i18n.t("Select a file-capable program")}
                        <select
                            data-testid="program-select"
                            value={selectedProgramId}
                            onChange={event => {
                                onSelectProgram(event.target.value);
                            }}
                        >
                            <option value="">{i18n.t("Choose a program")}</option>
                            {programsState.data.map(program => (
                                <option key={program.id} value={program.id}>
                                    {program.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
                <div className="actions-row">
                    <Button small onClick={onReloadPrograms}>
                        {i18n.t("Reload programs")}
                    </Button>
                </div>
            </section>
        );
    }
);
