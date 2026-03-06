import React from "react";
import { CircularLoader, NoticeBox } from "@dhis2/ui";
import { ProgramFileProperties } from "$/domain/entities/FileExportProgram";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import i18n from "$/utils/i18n";

type Props = {
    selectedProgramId: string;
    programDetailsState: AsyncData<ProgramFileProperties>;
};

/**
 * Renders details and file properties for the selected program.
 */
export const ProgramDetails: React.FC<Props> = React.memo(
    ({ selectedProgramId, programDetailsState }) => {
        return (
            <section className="panel" aria-label="program-details">
                <h3>{i18n.t("Selected program details")}</h3>
                {!selectedProgramId && (
                    <NoticeBox title={i18n.t("No program selected")}>
                        {i18n.t("Select a program to inspect its file properties.")}
                    </NoticeBox>
                )}
                {selectedProgramId && programDetailsState.status === "loading" && (
                    <CircularLoader small />
                )}
                {selectedProgramId && programDetailsState.status === "error" && (
                    <NoticeBox error title={i18n.t("Could not inspect program")}>
                        {programDetailsState.error}
                    </NoticeBox>
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
                                        {property.name} ({property.sourceType}, {property.valueType}
                                        )
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <NoticeBox title={i18n.t("No file properties found")}>
                                {i18n.t("This program has no resolvable file-capable properties.")}
                            </NoticeBox>
                        )}
                    </>
                )}
            </section>
        );
    }
);
