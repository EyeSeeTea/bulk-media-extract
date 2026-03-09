import { describe, expect, it } from "vitest";
import {
    buildExportExecutionConfiguration,
    buildExportExecutionConfigurationFilename,
} from "$/webapp/pages/wizard/exportExecutionConfiguration";
import { ExportPreviewRow } from "$/webapp/pages/wizard/previewUtils";

describe("exportExecutionConfiguration", () => {
    it("builds execution configuration operations from exportable preview rows", () => {
        const configuration = buildExportExecutionConfiguration({
            generatedAt: "2026-03-09T10:20:30.000Z",
            selectedProgramId: "prog-a",
            selectedProgramName: "Antenatal Visit",
            selectedOrgUnitId: "ou-a",
            selectedOrgUnitName: "Central Clinic",
            orgUnitSelectionMode: "descendants",
            dateFrom: "2026-01-01",
            dateTo: "2026-01-31",
            selectedFileMappings: [
                {
                    id: "de-file",
                    name: "Visit Form",
                    template: "/exports/{orgUnitName}/{fileName}",
                    programStageId: "stage-1",
                    programStageName: "Main Stage",
                },
            ],
            previewRows: [
                {
                    id: "evt-1:de-file",
                    eventId: "evt-1",
                    eventOrgUnitId: "ou-a",
                    eventOrgUnitName: "Central Clinic",
                    fileDataValue: "file-123",
                    fileDataValueId: "de-file",
                    fileDataValueName: "Visit Form",
                    fileDataValueUrl:
                        "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file",
                    programStageId: "stage-1",
                    programStageName: "Main Stage",
                    fileResourceId: "file-123",
                    fileName: "visit-form.pdf",
                    fileSize: 1024,
                    resolvedTargetPath: "/exports/Central Clinic/visit-form.pdf",
                    hasDuplicateTargetPath: false,
                    isMissingFileResource: false,
                },
            ] satisfies ExportPreviewRow[],
        });

        expect(configuration).toEqual({
            version: "1",
            generatedAt: "2026-03-09T10:20:30.000Z",
            scope: {
                program: {
                    id: "prog-a",
                    name: "Antenatal Visit",
                },
                orgUnit: {
                    id: "ou-a",
                    name: "Central Clinic",
                    mode: "descendants",
                },
                dateRange: {
                    from: "2026-01-01",
                    to: "2026-01-31",
                },
                fileMappings: [
                    {
                        id: "de-file",
                        name: "Visit Form",
                        template: "/exports/{orgUnitName}/{fileName}",
                        programStageId: "stage-1",
                        programStageName: "Main Stage",
                    },
                ],
            },
            summary: {
                totalPreviewRows: 1,
                exportableOperations: 1,
                skippedMissingFileResource: 0,
            },
            operations: [
                {
                    source: {
                        url: "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file",
                        fileResourceId: "file-123",
                        fileSize: 1024,
                    },
                    target: {
                        path: "/exports/Central Clinic/visit-form.pdf",
                    },
                },
            ],
        });
    });

    it("excludes skipped preview rows and records summary counts", () => {
        const configuration = buildExportExecutionConfiguration({
            generatedAt: "2026-03-09T10:20:30.000Z",
            selectedProgramId: "prog-a",
            selectedProgramName: "Antenatal Visit",
            selectedOrgUnitId: "ou-a",
            selectedOrgUnitName: "Central Clinic",
            orgUnitSelectionMode: "selected",
            dateFrom: "",
            dateTo: "",
            selectedFileMappings: [],
            previewRows: [
                {
                    id: "evt-1:de-file",
                    eventId: "evt-1",
                    eventOrgUnitId: "ou-a",
                    eventOrgUnitName: "Central Clinic",
                    fileDataValue: "file-123",
                    fileDataValueId: "de-file",
                    fileDataValueName: "Visit Form",
                    fileDataValueUrl:
                        "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file",
                    fileResourceId: "file-123",
                    fileName: "visit-form.pdf",
                    fileSize: 1024,
                    resolvedTargetPath: "/exports/visit-form.pdf",
                    hasDuplicateTargetPath: false,
                    isMissingFileResource: false,
                },
                {
                    id: "evt-2:de-file-b",
                    eventId: "evt-2",
                    eventOrgUnitId: "ou-a",
                    eventOrgUnitName: "Central Clinic",
                    fileDataValue: "missing-resource-value",
                    fileDataValueId: "de-file-b",
                    fileDataValueName: "Consent Form",
                    fileDataValueUrl:
                        "http://localhost:8081/dhis2/api/41/tracker/events/evt-2/dataValues/de-file-b/file",
                    fileResourceId: "missing-resource-value",
                    fileName: undefined,
                    fileSize: undefined,
                    resolvedTargetPath: undefined,
                    hasDuplicateTargetPath: false,
                    isMissingFileResource: true,
                },
            ] satisfies ExportPreviewRow[],
        });

        expect(configuration.summary).toEqual({
            totalPreviewRows: 2,
            exportableOperations: 1,
            skippedMissingFileResource: 1,
        });
        expect(configuration.operations).toEqual([
            {
                source: {
                    url: "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file",
                    fileResourceId: "file-123",
                    fileSize: 1024,
                },
                target: {
                    path: "/exports/visit-form.pdf",
                },
            },
        ]);
    });

    it("builds deterministic execution configuration filenames", () => {
        expect(
            buildExportExecutionConfigurationFilename("prog-a", "2026-03-09T10:20:30.000Z")
        ).toBe("export-execution-configuration-prog-a-2026-03-09T10-20-30-000Z.json");
    });
});
