import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import type { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { OrgUnitTreePicker } from "$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker";
import { AsyncData } from "$/webapp/hooks/useAsyncData";
import { StepIntro } from "$/webapp/components/wizard/StepIntro";
import { getPropertyTemplateToken } from "$/application/export/TemplateBuilder";
import { insertAtCursor } from "$/webapp/pages/wizard/templateInputUtils";
import {
    getVisiblePropertyGroupsForFile,
    ProgramOption,
    FILE_VALUE_TYPES,
} from "$/webapp/pages/wizard/wizardShared";
import { validateTemplate } from "$/webapp/pages/wizard/wizardConfig";
import i18n from "$/utils/i18n";

type TemplateStepProps = {
    selectedProgram?: ProgramOption;
    programDetailsState: AsyncData<ProgramFileProperties>;
    selectedOrgUnitId: string;
    orgUnitSelectionMode: OrgUnitSelectionMode;
    dateFrom: string;
    dateTo: string;
    selectedFileDataElements: ProgramFileProperty[];
    mappingByFileKey: Record<string, string>;
    quickPreviewState: AsyncData<ProgramEventsPreviewResult>;
    quickPreviewByFileKey: Record<string, string[]>;
    onSelectOrgUnit: (selection: { id: string; name?: string }) => void;
    onSelectionModeChange: (mode: OrgUnitSelectionMode) => void;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    onMappingChange: (fileKey: string, mapping: string) => void;
    onRetryPreview: () => void;
};

export const TemplateStep: React.FC<TemplateStepProps> = ({
    selectedProgram,
    programDetailsState,
    selectedOrgUnitId,
    orgUnitSelectionMode,
    dateFrom,
    dateTo,
    selectedFileDataElements,
    mappingByFileKey,
    quickPreviewState,
    quickPreviewByFileKey,
    onSelectOrgUnit,
    onSelectionModeChange,
    onDateFromChange,
    onDateToChange,
    onMappingChange,
    onRetryPreview,
}) => {
    const hasPreviewScope = Boolean(selectedProgram && selectedOrgUnitId);
    const selectedFileIdSet = React.useMemo(() => {
        return new Set(selectedFileDataElements.map(property => property.id));
    }, [selectedFileDataElements]);

    const templateInputRefs = React.useRef<Record<string, HTMLTextAreaElement | null>>({});

    const onInsertTemplateToken = React.useCallback(
        (fileKey: string, token: string) => {
            const input = templateInputRefs.current[fileKey];
            const currentValue = mappingByFileKey[fileKey] ?? "";
            const result = insertAtCursor(
                currentValue,
                token,
                input?.selectionStart,
                input?.selectionEnd
            );

            onMappingChange(fileKey, result.value);
            window.setTimeout(() => {
                const nextInput = templateInputRefs.current[fileKey];
                if (!nextInput) {
                    return;
                }
                nextInput.focus();
                nextInput.setSelectionRange(result.caret, result.caret);
            }, 0);
        },
        [mappingByFileKey, onMappingChange]
    );

    return (
        <div className="wizard-step-content" aria-label="wizard-step-template">
            <StepIntro
                title={i18n.t("Define the export scope and filename templates")}
                description={i18n.t(
                    "Choose where to look for records, then define the destination path for each selected file field."
                )}
            />
            <section className="wizard-section">
                <h4>{i18n.t("Filters")}</h4>

                <label className="field-label" htmlFor="wizard-org-unit-tree">
                    {i18n.t("Organisation unit")}
                </label>
                {!selectedProgram ? (
                    <NoticeBox title={i18n.t("Program required")}>
                        {i18n.t("Select a program first to filter by organisation unit.")}
                    </NoticeBox>
                ) : (
                    <OrgUnitTreePicker
                        programOrgUnits={selectedProgram.organisationUnits}
                        selected={selectedOrgUnitId}
                        onChange={onSelectOrgUnit}
                    />
                )}

                <label className="field-label" htmlFor="wizard-org-unit-mode">
                    {i18n.t("Include")}
                </label>
                <select
                    id="wizard-org-unit-mode"
                    data-testid="wizard-org-unit-mode"
                    value={orgUnitSelectionMode}
                    onChange={event =>
                        onSelectionModeChange(event.target.value as OrgUnitSelectionMode)
                    }
                >
                    <option value="selected">{i18n.t("Selected")}</option>
                    <option value="descendants">{i18n.t("Descendants")}</option>
                </select>

                <div className="date-grid">
                    <div>
                        <label className="field-label" htmlFor="wizard-date-from">
                            {i18n.t("Date from (optional)")}
                        </label>
                        <input
                            id="wizard-date-from"
                            data-testid="wizard-date-from"
                            type="date"
                            value={dateFrom}
                            onChange={event => onDateFromChange(event.target.value)}
                        />
                    </div>
                    <div>
                        <label className="field-label" htmlFor="wizard-date-to">
                            {i18n.t("Date to (optional)")}
                        </label>
                        <input
                            id="wizard-date-to"
                            data-testid="wizard-date-to"
                            type="date"
                            value={dateTo}
                            onChange={event => onDateToChange(event.target.value)}
                        />
                    </div>
                </div>
            </section>

            {selectedFileDataElements.length === 0 ? (
                <section className="wizard-section">
                    <NoticeBox title={i18n.t("No selected files")}>
                        {i18n.t(
                            "Go back to step 1 and select at least one file data value to sync."
                        )}
                    </NoticeBox>
                </section>
            ) : (
                selectedFileDataElements.map((fileProperty, fileIndex) => {
                    const templateValue = mappingByFileKey[fileProperty.id] ?? "";
                    const templateError = validateTemplate(templateValue);
                    const isTemplateMissing = !templateValue.trim();
                    const resolvedTemplates = quickPreviewByFileKey[fileProperty.id] ?? [];
                    const visiblePropertyGroups =
                        programDetailsState.status === "success"
                            ? getVisiblePropertyGroupsForFile(
                                  programDetailsState.data.propertyGroups,
                                  selectedFileDataElements,
                                  fileProperty
                              )
                            : [];

                    return (
                        <section className="wizard-section" key={fileProperty.id}>
                            <h4>
                                {i18n.t("Path and filename template - {{name}}", {
                                    name: fileProperty.name,
                                })}
                            </h4>
                            <div className="template-builder-grid">
                                <div className="template-editor-panel">
                                    <textarea
                                        ref={input => {
                                            templateInputRefs.current[fileProperty.id] = input;
                                        }}
                                        className={
                                            templateError ? "wizard-input-invalid" : undefined
                                        }
                                        data-testid={
                                            fileIndex === 0
                                                ? "wizard-template-input"
                                                : `wizard-template-input-${fileProperty.id}`
                                        }
                                        rows={5}
                                        value={templateValue}
                                        onChange={event =>
                                            onMappingChange(fileProperty.id, event.target.value)
                                        }
                                    />
                                    <p className="wizard-helper-text template-editor-hint">
                                        {i18n.t(
                                            "Use tokens like {orgUnitName}, {enrollmentDate}, {attribute:NationalID}, {dataElement:FileName}.",
                                            { nsSeparator: false }
                                        )}
                                    </p>
                                    {templateError ? (
                                        <p
                                            className={`template-editor-feedback ${
                                                isTemplateMissing
                                                    ? "template-editor-feedback-muted"
                                                    : "template-editor-feedback-error"
                                            }`}
                                            data-testid={`wizard-template-feedback-${fileProperty.id}`}
                                        >
                                            {isTemplateMissing
                                                ? i18n.t("Required.")
                                                : templateError}
                                        </p>
                                    ) : (
                                        <div
                                            className="template-preview-inline"
                                            data-testid={`wizard-template-preview-${fileProperty.id}`}
                                        >
                                            <p className="template-preview-inline-title">
                                                {i18n.t("Valid template. Preview:", {
                                                    nsSeparator: false,
                                                })}
                                            </p>
                                            {!hasPreviewScope ? (
                                                <p className="template-editor-feedback template-editor-feedback-muted">
                                                    {i18n.t(
                                                        "Select program and organisation unit to load resolved values."
                                                    )}
                                                </p>
                                            ) : quickPreviewState.status === "loading" ? (
                                                <div className="wizard-inline-loader">
                                                    <CircularLoader small />
                                                </div>
                                            ) : quickPreviewState.status === "error" ? (
                                                <p className="template-editor-feedback template-editor-feedback-error">
                                                    {i18n.t("Could not load resolved values.")}{" "}
                                                    <Button small onClick={onRetryPreview}>
                                                        {i18n.t("Retry preview")}
                                                    </Button>
                                                </p>
                                            ) : resolvedTemplates.length === 0 ? (
                                                <p className="template-editor-feedback template-editor-feedback-muted">
                                                    {i18n.t(
                                                        "No resolved template values found for current filters."
                                                    )}
                                                </p>
                                            ) : (
                                                <ul
                                                    data-testid={`wizard-resolved-template-list-${fileProperty.id}`}
                                                >
                                                    {resolvedTemplates.map(
                                                        (resolvedTemplate, index) => (
                                                            <li
                                                                key={`${fileProperty.id}:${String(
                                                                    index
                                                                )}`}
                                                            >
                                                                {resolvedTemplate}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="template-properties-panel">
                                    <h5>{i18n.t("Available properties")}</h5>
                                    {!selectedProgram ? (
                                        <NoticeBox title={i18n.t("Program required")}>
                                            {i18n.t(
                                                "Select a program to inspect available properties."
                                            )}
                                        </NoticeBox>
                                    ) : programDetailsState.status === "loading" ? (
                                        <CircularLoader small />
                                    ) : programDetailsState.status === "error" ? (
                                        <NoticeBox
                                            error
                                            title={i18n.t("Could not inspect program properties")}
                                        >
                                            {programDetailsState.error}
                                        </NoticeBox>
                                    ) : programDetailsState.status === "success" &&
                                      visiblePropertyGroups.length > 0 ? (
                                        <div
                                            className="template-property-groups"
                                            data-testid="wizard-property-groups"
                                        >
                                            {visiblePropertyGroups.map(group => (
                                                <div
                                                    key={group.id}
                                                    className="template-property-group"
                                                >
                                                    <p className="template-property-group-title">
                                                        {group.name}
                                                    </p>
                                                    <ul>
                                                        {group.properties.map(property => {
                                                            if (
                                                                group.id !== "fileMetadata" &&
                                                                property.sourceType ===
                                                                    "dataElement" &&
                                                                FILE_VALUE_TYPES.has(
                                                                    property.valueType
                                                                ) &&
                                                                !selectedFileIdSet.has(property.id)
                                                            ) {
                                                                return null;
                                                            }
                                                            const token =
                                                                getPropertyTemplateToken(property);
                                                            return (
                                                                <li
                                                                    key={`${group.id}:${property.sourceType}:${property.id}`}
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        className="template-token-button"
                                                                        data-testid={
                                                                            fileIndex === 0
                                                                                ? `wizard-token-${property.id}`
                                                                                : `wizard-token-${fileProperty.id}-${property.id}`
                                                                        }
                                                                        onClick={() =>
                                                                            onInsertTemplateToken(
                                                                                fileProperty.id,
                                                                                token
                                                                            )
                                                                        }
                                                                    >
                                                                        {property.name}
                                                                        <span>{token}</span>
                                                                    </button>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <NoticeBox title={i18n.t("No properties found")}>
                                            {i18n.t(
                                                "No resolvable properties were found for this program."
                                            )}
                                        </NoticeBox>
                                    )}
                                </div>
                            </div>
                        </section>
                    );
                })
            )}
        </div>
    );
};
