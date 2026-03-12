import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { NamedRef } from "$/domain/entities/Ref";
import { OrgUnitTreePicker } from "$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import i18n from "$/utils/i18n";

type Props = {
    programOrgUnits: NamedRef[];
    selectedProgramId: string;
    selectedOrgUnitId: string;
    onSelectOrgUnit: (selection: { id: string; name?: string }) => void;
    previewState: AsyncData<ProgramEventsPreviewResult>;
    onRetryPreview: () => void;
};

/**
 * Renders organisation unit selector and event preview results.
 */
export const EventPreview: React.FC<Props> = React.memo(
    ({
        programOrgUnits,
        selectedProgramId,
        selectedOrgUnitId,
        onSelectOrgUnit,
        previewState,
        onRetryPreview,
    }) => {
        const previewTotal =
            previewState.status === "success"
                ? String(previewState.data.total ?? previewState.data.events.length)
                : "";
        const previewPages =
            previewState.status === "success" ? String(previewState.data.pageCount ?? 1) : "";

        return (
            <section className="panel" aria-label="org-unit-preview">
                <h3>{i18n.t("Event preview")}</h3>

                <label className="field-label">
                    {i18n.t("Select organisation unit")}
                    {!selectedProgramId ? (
                        <NoticeBox title={i18n.t("Program required")}>
                            {i18n.t("Select a program to load organisation units.")}
                        </NoticeBox>
                    ) : programOrgUnits.length === 0 ? (
                        <NoticeBox title={i18n.t("No organisation units available")}>
                            {i18n.t(
                                "The selected program has no organisation units available for selection."
                            )}
                        </NoticeBox>
                    ) : (
                        <OrgUnitTreePicker
                            programOrgUnits={programOrgUnits}
                            selected={selectedOrgUnitId}
                            onChange={onSelectOrgUnit}
                        />
                    )}
                </label>

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
                        <p>
                            {i18n.t("Matching events: {{total}}. Pages: {{pages}}.", {
                                total: previewTotal,
                                pages: previewPages,
                                nsSeparator: false,
                            })}
                        </p>
                        {previewState.data.events.length === 0 ? (
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
                                    {previewState.data.events.map(event => (
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
