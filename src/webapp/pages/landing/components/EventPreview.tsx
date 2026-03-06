import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { ProgramEventPreview } from "$/domain/entities/FileExportProgram";
import { NamedRef } from "$/domain/entities/Ref";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import i18n from "$/utils/i18n";

type Props = {
    orgUnitsState: AsyncData<NamedRef[]>;
    selectedProgramId: string;
    selectedOrgUnitId: string;
    onSelectOrgUnit: (orgUnitId: string) => void;
    previewState: AsyncData<ProgramEventPreview[]>;
    onRetryPreview: () => void;
};

/**
 * Renders organisation unit selector and event preview results.
 */
export const EventPreview: React.FC<Props> = React.memo(
    ({
        orgUnitsState,
        selectedProgramId,
        selectedOrgUnitId,
        onSelectOrgUnit,
        previewState,
        onRetryPreview,
    }) => {
        return (
            <section className="panel" aria-label="org-unit-preview">
                <h3>{i18n.t("Event preview")}</h3>

                {orgUnitsState.status === "loading" && <CircularLoader small />}
                {orgUnitsState.status === "error" && (
                    <NoticeBox error title={i18n.t("Could not load organisation units")}>
                        {orgUnitsState.error}
                    </NoticeBox>
                )}
                {orgUnitsState.status === "success" && (
                    <label className="field-label">
                        {i18n.t("Select organisation unit")}
                        <select
                            data-testid="org-unit-select"
                            value={selectedOrgUnitId}
                            onChange={event => onSelectOrgUnit(event.target.value)}
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
                    <NoticeBox title={i18n.t("Preview requirements")}>
                        {i18n.t(
                            "Select both a program and an organisation unit to preview events."
                        )}
                    </NoticeBox>
                ) : null}

                {selectedProgramId && selectedOrgUnitId && previewState.status === "loading" && (
                    <CircularLoader small />
                )}
                {selectedProgramId && selectedOrgUnitId && previewState.status === "error" && (
                    <div>
                        <NoticeBox error title={i18n.t("Could not load event preview")}>
                            {previewState.error}
                        </NoticeBox>
                        <div className="actions-row">
                            <Button small onClick={onRetryPreview}>
                                {i18n.t("Retry preview")}
                            </Button>
                        </div>
                    </div>
                )}
                {selectedProgramId && selectedOrgUnitId && previewState.status === "success" && (
                    <>
                        {previewState.data.length === 0 ? (
                            <NoticeBox title={i18n.t("No events found")}>
                                {i18n.t("No preview events match the current selections.")}
                            </NoticeBox>
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
        );
    }
);
