import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { ProgramEventPreview, ProgramFileProperties } from "$/domain/entities/FileExportProgram";
import { NamedRef } from "$/domain/entities/Ref";
import { useAppContext } from "$/webapp/contexts/app-context";
import i18n from "$/utils/i18n";
import "./LandingPage.css";

type AsyncData<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: string };

export const LandingPage: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();

    const [programsState, setProgramsState] = React.useState<AsyncData<Array<{ id: string; name: string }>>>({
        status: "loading",
    });
    const [orgUnitsState, setOrgUnitsState] = React.useState<AsyncData<NamedRef[]>>({ status: "loading" });

    const [selectedProgramId, setSelectedProgramId] = React.useState("");
    const [selectedOrgUnitId, setSelectedOrgUnitId] = React.useState("");

    const [programDetailsState, setProgramDetailsState] = React.useState<AsyncData<ProgramFileProperties>>({
        status: "idle",
    });
    const [previewState, setPreviewState] = React.useState<AsyncData<ProgramEventPreview[]>>({ status: "idle" });

    const programDetailsCache = React.useRef(new Map<string, ProgramFileProperties>());
    const previewCache = React.useRef(new Map<string, ProgramEventPreview[]>());

    const loadPrograms = React.useCallback(async () => {
        setProgramsState({ status: "loading" });

        try {
            const programs = await compositionRoot.programs.getFileCapable.execute().toPromise();
            setProgramsState({
                status: "success",
                data: programs.map(program => ({ id: program.id, name: program.name })),
            });
        } catch (error) {
            setProgramsState({
                status: "error",
                error: getErrorMessage(error),
            });
        }
    }, [compositionRoot.programs.getFileCapable]);

    const loadOrgUnits = React.useCallback(async () => {
        setOrgUnitsState({ status: "loading" });

        try {
            const orgUnits = await compositionRoot.programs.getOrganisationUnits.execute().toPromise();
            setOrgUnitsState({ status: "success", data: orgUnits });
        } catch (error) {
            setOrgUnitsState({ status: "error", error: getErrorMessage(error) });
        }
    }, [compositionRoot.programs.getOrganisationUnits]);

    React.useEffect(() => {
        void loadPrograms();
        void loadOrgUnits();
    }, [loadPrograms, loadOrgUnits]);

    const loadProgramDetails = React.useCallback(
        async (programId: string) => {
            if (!programId) {
                setProgramDetailsState({ status: "idle" });
                return;
            }

            const cached = programDetailsCache.current.get(programId);
            if (cached) {
                setProgramDetailsState({ status: "success", data: cached });
                return;
            }

            setProgramDetailsState({ status: "loading" });
            try {
                const details = await compositionRoot.programs.getFileProperties.execute(programId).toPromise();
                programDetailsCache.current.set(programId, details);
                setProgramDetailsState({ status: "success", data: details });
            } catch (error) {
                setProgramDetailsState({ status: "error", error: getErrorMessage(error) });
            }
        },
        [compositionRoot.programs.getFileProperties]
    );

    React.useEffect(() => {
        void loadProgramDetails(selectedProgramId);
    }, [selectedProgramId, loadProgramDetails]);

    const loadPreview = React.useCallback(
        async (programId: string, orgUnitId: string) => {
            if (!programId || !orgUnitId) {
                setPreviewState({ status: "idle" });
                return;
            }

            const cacheKey = `${programId}:${orgUnitId}`;
            const cached = previewCache.current.get(cacheKey);
            if (cached) {
                setPreviewState({ status: "success", data: cached });
                return;
            }

            setPreviewState({ status: "loading" });
            try {
                const preview = await compositionRoot.programs.getEventsPreview
                    .execute(programId, orgUnitId)
                    .toPromise();
                previewCache.current.set(cacheKey, preview);
                setPreviewState({ status: "success", data: preview });
            } catch (error) {
                setPreviewState({ status: "error", error: getErrorMessage(error) });
            }
        },
        [compositionRoot.programs.getEventsPreview]
    );

    React.useEffect(() => {
        void loadPreview(selectedProgramId, selectedOrgUnitId);
    }, [selectedProgramId, selectedOrgUnitId, loadPreview]);

    return (
        <div className="landing-page">
            <h2>{i18n.t("File Export Program Picker")}</h2>

            <section className="panel" aria-label="program-picker">
                <h3>{i18n.t("Program")}</h3>
                {programsState.status === "loading" && <CircularLoader small />}
                {programsState.status === "error" && (
                    <NoticeBox error title={i18n.t("Could not load programs")}>{programsState.error}</NoticeBox>
                )}
                {programsState.status === "success" && (
                    <label className="field-label">
                        {i18n.t("Select a file-capable program")}
                        <select
                            data-testid="program-select"
                            value={selectedProgramId}
                            onChange={event => {
                                setSelectedProgramId(event.target.value);
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
                    <Button
                        small
                        onClick={() => {
                            void loadPrograms();
                        }}
                    >
                        {i18n.t("Reload programs")}
                    </Button>
                </div>
            </section>

            <section className="panel" aria-label="program-details">
                <h3>{i18n.t("Selected program details")}</h3>
                {!selectedProgramId && (
                    <NoticeBox title={i18n.t("No program selected")}>{i18n.t("Select a program to inspect its file properties.")}</NoticeBox>
                )}
                {selectedProgramId && programDetailsState.status === "loading" && <CircularLoader small />}
                {selectedProgramId && programDetailsState.status === "error" && (
                    <NoticeBox error title={i18n.t("Could not inspect program")}>{programDetailsState.error}</NoticeBox>
                )}
                {selectedProgramId && programDetailsState.status === "success" && (
                    <>
                        <p>
                            <strong>{i18n.t("Program type")}: </strong>
                            {programDetailsState.data.program.programType}
                        </p>

                        {programDetailsState.data.properties.length > 0 ? (
                            <ul>
                                {programDetailsState.data.properties.map(property => (
                                    <li key={`${property.sourceType}:${property.id}`}>
                                        {property.name} ({property.sourceType}, {property.valueType})
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <NoticeBox title={i18n.t("No file properties found")}>{i18n.t("This program has no resolvable file-capable properties.")}</NoticeBox>
                        )}
                    </>
                )}
            </section>

            <section className="panel" aria-label="org-unit-preview">
                <h3>{i18n.t("Event preview")}</h3>

                {orgUnitsState.status === "loading" && <CircularLoader small />}
                {orgUnitsState.status === "error" && (
                    <NoticeBox error title={i18n.t("Could not load organisation units")}>{orgUnitsState.error}</NoticeBox>
                )}
                {orgUnitsState.status === "success" && (
                    <label className="field-label">
                        {i18n.t("Select organisation unit")}
                        <select
                            data-testid="org-unit-select"
                            value={selectedOrgUnitId}
                            onChange={event => setSelectedOrgUnitId(event.target.value)}
                            disabled={!selectedProgramId}
                        >
                            <option value="">{i18n.t("Choose an organisation unit")}</option>
                            {orgUnitsState.data.map(orgUnit => (
                                <option key={orgUnit.id} value={orgUnit.id}>
                                    {orgUnit.name}
                                </option>
                            ))}
                        </select>
                    </label>
                )}

                {!selectedProgramId || !selectedOrgUnitId ? (
                    <NoticeBox title={i18n.t("Preview requirements")}>{i18n.t("Select both a program and an organisation unit to preview events.")}</NoticeBox>
                ) : null}

                {selectedProgramId && selectedOrgUnitId && previewState.status === "loading" && <CircularLoader small />}
                {selectedProgramId && selectedOrgUnitId && previewState.status === "error" && (
                    <div>
                        <NoticeBox error title={i18n.t("Could not load event preview")}>{previewState.error}</NoticeBox>
                        <div className="actions-row">
                            <Button
                                small
                                onClick={() => {
                                    void loadPreview(selectedProgramId, selectedOrgUnitId);
                                }}
                            >
                                {i18n.t("Retry preview")}
                            </Button>
                        </div>
                    </div>
                )}
                {selectedProgramId && selectedOrgUnitId && previewState.status === "success" && (
                    <>
                        {previewState.data.length === 0 ? (
                            <NoticeBox title={i18n.t("No events found")}>{i18n.t("No preview events match the current selections.")}</NoticeBox>
                        ) : (
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>{i18n.t("Event")}</th>
                                        <th>{i18n.t("Date")}</th>
                                        <th>{i18n.t("Org unit")}</th>
                                        <th>{i18n.t("File values")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewState.data.map(event => (
                                        <tr key={event.id}>
                                            <td>{event.id}</td>
                                            <td>{event.eventDate ?? "-"}</td>
                                            <td>{event.orgUnitName ?? event.orgUnitId}</td>
                                            <td>
                                                {Object.entries(event.fileValues)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(", ") || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                )}
            </section>
        </div>
    );
});

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    return i18n.t("Unknown error");
}
