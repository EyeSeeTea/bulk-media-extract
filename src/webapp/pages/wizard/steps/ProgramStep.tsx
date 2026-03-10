import React from "react";
import {
    CheckboxField,
    CircularLoader,
    NoticeBox,
    SingleSelectField,
    SingleSelectOption,
} from "@dhis2/ui";
import { ProgramFileProperties } from "$/domain/entities/FileExportProgram";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { getProgramTypeLabel } from "$/webapp/utils/programTypeLabel";
import { StepIntro } from "$/webapp/pages/wizard/components/StepIntro";
import { FILE_VALUE_TYPES, ProgramOption } from "$/webapp/pages/wizard/wizardShared";
import i18n from "$/utils/i18n";

type ProgramStepProps = {
    programsState: AsyncData<ProgramOption[]>;
    selectedProgramId: string;
    programDetailsState: AsyncData<ProgramFileProperties>;
    selectedFileDataValueIds: string[];
    onSelectProgram: (programId: string) => void;
    onSelectFileDataValueIds: (selectedFileDataValueIds: string[]) => void;
};

export const ProgramStep: React.FC<ProgramStepProps> = ({
    programsState,
    selectedProgramId,
    programDetailsState,
    selectedFileDataValueIds,
    onSelectProgram,
    onSelectFileDataValueIds,
}) => {
    const fileDataElements = React.useMemo(() => {
        if (programDetailsState.status !== "success") {
            return [];
        }

        return programDetailsState.data.properties.filter(
            property =>
                property.sourceType === "dataElement" && FILE_VALUE_TYPES.has(property.valueType)
        );
    }, [programDetailsState]);

    const selectedIdSet = React.useMemo(() => {
        return new Set(selectedFileDataValueIds);
    }, [selectedFileDataValueIds]);
    const selectedProgram = React.useMemo(() => {
        if (programsState.status !== "success") {
            return undefined;
        }

        return programsState.data.find(program => program.id === selectedProgramId);
    }, [programsState, selectedProgramId]);
    const stageNames = React.useMemo(() => {
        return Array.from(
            new Set(
                fileDataElements
                    .map(item => item.sourceContainerName)
                    .filter((name): name is string => Boolean(name))
            )
        );
    }, [fileDataElements]);
    const showProgramSummary = Boolean(selectedProgramId);

    const onToggleFileSelection = React.useCallback(
        (fileDataElementId: string) => {
            const nextSelection = selectedIdSet.has(fileDataElementId)
                ? selectedFileDataValueIds.filter(selectedId => selectedId !== fileDataElementId)
                : [...selectedFileDataValueIds, fileDataElementId];
            onSelectFileDataValueIds(nextSelection);
        },
        [onSelectFileDataValueIds, selectedFileDataValueIds, selectedIdSet]
    );

    return (
        <div className="wizard-step-content wizard-program-step" aria-label="wizard-step-program">
            <StepIntro
                title={i18n.t("Choose a program and the files to export")}
                description={i18n.t(
                    "Start by selecting the tracker program. Then confirm which file data values should move forward to template setup and preview."
                )}
            />
            <div
                className={`wizard-program-step-layout${showProgramSummary ? " with-summary" : ""}`}
            >
                <div className="wizard-program-step-main">
                    <section className="wizard-section wizard-program-step-hero">
                        {programsState.status === "loading" ? <CircularLoader small /> : null}
                        {programsState.status === "error" ? (
                            <NoticeBox error title={i18n.t("Could not load programs")}>
                                {programsState.error}
                            </NoticeBox>
                        ) : null}
                        {programsState.status === "success" ? (
                            <div>
                                <select
                                    className="wizard-program-select-native"
                                    data-testid="wizard-program-select"
                                    aria-hidden="true"
                                    tabIndex={-1}
                                    value={selectedProgramId}
                                    onChange={event => onSelectProgram(event.target.value)}
                                >
                                    <option value="">{i18n.t("Choose a program")}</option>
                                    {programsState.data.map(program => (
                                        <option key={program.id} value={program.id}>
                                            {program.name}
                                        </option>
                                    ))}
                                </select>
                                <SingleSelectField
                                    selected={selectedProgramId || undefined}
                                    label={i18n.t("Program")}
                                    placeholder={i18n.t("Choose a program")}
                                    helpText={i18n.t(
                                        "Only programs with file-capable data values are listed."
                                    )}
                                    filterable
                                    filterPlaceholder={i18n.t("Search programs")}
                                    noMatchText={i18n.t("No matching programs")}
                                    onChange={({ selected }) => onSelectProgram(selected)}
                                >
                                    {programsState.data.map(program => (
                                        <SingleSelectOption
                                            key={program.id}
                                            value={program.id}
                                            label={program.name}
                                        />
                                    ))}
                                </SingleSelectField>
                            </div>
                        ) : null}
                    </section>

                    <section className="wizard-section">
                        <div className="wizard-program-step-section-header">
                            <h4>{i18n.t("File data values to sync")}</h4>
                            <p className="wizard-helper-text">
                                {i18n.t("Choose the file fields to include in the export flow.")}
                            </p>
                        </div>

                        {!selectedProgramId ? (
                            <NoticeBox title={i18n.t("Program required")}>
                                {i18n.t("Select a program to inspect file data values.")}
                            </NoticeBox>
                        ) : programDetailsState.status === "loading" ? (
                            <div className="wizard-inline-loader">
                                <CircularLoader small />
                                <span>{i18n.t("Loading file-capable data values")}</span>
                            </div>
                        ) : programDetailsState.status === "error" ? (
                            <NoticeBox error title={i18n.t("Could not inspect program")}>
                                {programDetailsState.error}
                            </NoticeBox>
                        ) : fileDataElements.length === 0 ? (
                            <NoticeBox title={i18n.t("No file data elements")}>
                                {i18n.t("No file-capable data elements were found in this program.")}
                            </NoticeBox>
                        ) : (
                            <>
                                <div className="wizard-program-step-selection-summary">
                                    {i18n.t("Selected: {{count}} of {{total}}", {
                                        count: String(selectedFileDataValueIds.length),
                                        total: String(fileDataElements.length),
                                        nsSeparator: false,
                                    })}
                                </div>
                                <div
                                    className="wizard-program-file-list"
                                    data-testid="wizard-file-data-elements"
                                >
                                    {fileDataElements.map(item => {
                                        const isSelected = selectedIdSet.has(item.id);

                                        return (
                                            <div
                                                key={item.id}
                                                className={`wizard-program-file-card${isSelected ? " selected" : ""}`}
                                                data-testid={`wizard-file-select-${item.id}`}
                                                role="checkbox"
                                                aria-checked={isSelected}
                                                tabIndex={0}
                                                onClick={() => onToggleFileSelection(item.id)}
                                                onKeyDown={event => {
                                                    if (event.key === " " || event.key === "Enter") {
                                                        event.preventDefault();
                                                        onToggleFileSelection(item.id);
                                                    }
                                                }}
                                            >
                                                <div
                                                    className="wizard-program-file-card-checkbox"
                                                    onClick={event => event.stopPropagation()}
                                                >
                                                    <CheckboxField
                                                        checked={isSelected}
                                                        label={item.name}
                                                        onChange={() => onToggleFileSelection(item.id)}
                                                    />
                                                </div>
                                                <div className="wizard-program-file-card-meta">
                                                    <span className="wizard-program-file-pill">
                                                        {item.valueType}
                                                    </span>
                                                    <span className="wizard-program-file-pill">
                                                        {item.sourceContainerName ?? i18n.t("No program stage")}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </section>
                </div>

                {showProgramSummary ? (
                    <aside className="wizard-section wizard-program-step-summary">
                        <div className="wizard-program-step-summary-title">
                            {i18n.t("Program summary")}
                        </div>
                        {programDetailsState.status === "success" && selectedProgram ? (
                            <dl
                                className="wizard-program-step-summary-list"
                                data-testid="wizard-program-summary"
                            >
                                <div>
                                    <dt>{i18n.t("Program")}</dt>
                                    <dd>{selectedProgram.name}</dd>
                                </div>
                                <div>
                                    <dt>{i18n.t("Program type")}</dt>
                                    <dd>
                                        {getProgramTypeLabel(
                                            programDetailsState.data.program.programType
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt>{i18n.t("File fields found")}</dt>
                                    <dd>{String(fileDataElements.length)}</dd>
                                </div>
                                <div>
                                    <dt>{i18n.t("Program stages")}</dt>
                                    <dd>{stageNames.join(", ") || "-"}</dd>
                                </div>
                            </dl>
                        ) : (
                            <p className="wizard-helper-text">
                                {i18n.t("Program details will appear here once the selection is loaded.")}
                            </p>
                        )}
                        <NoticeBox title={i18n.t("Why this matters")}>
                            {i18n.t(
                                "The files selected here determine which mapping editors and preview rows appear in later steps."
                            )}
                        </NoticeBox>
                    </aside>
                ) : null}
            </div>
        </div>
    );
};
