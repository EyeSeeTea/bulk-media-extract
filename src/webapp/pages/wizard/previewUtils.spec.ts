import { ProgramEventPreview } from "$/domain/entities/ProgramEventPreview";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import {
    buildCaptureEventUrl,
    buildEventDataValueUrl,
    buildExportPreviewRows,
    summarizeExportPreview,
} from "$/application/export/PreviewBuilder";
import {
    formatFileSize,
    getPreviewCellValue,
    getPreviewFileWarning,
} from "$/webapp/presenters/previewFormatting";
import { parseDhis2Version } from "$/webapp/utils/dhis2Version";
import { describe, expect, it } from "vitest";

describe("previewUtils", () => {
    it("builds export preview rows with resolved target paths", () => {
        const rows = buildExportPreviewRows(
            [
                ProgramEventPreview.create({
                    id: "evt-1",
                    eventDate: "2026-01-10",
                    orgUnitId: "ou-a",
                    orgUnitName: "Central Clinic",
                    orgUnitAttributeValues: {},
                    dataValues: { "de-file": "file-123" },
                    attributeValues: {},
                    fileValues: { "de-file": "file-123" },
                    fileNames: { "de-file": "visit-form.pdf" },
                    fileSizes: { "de-file": 2048 },
                }),
            ],
            [
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "Visit Form",
                    valueType: "FILE_RESOURCE",
                    sourceType: "dataElement",
                }),
            ],
            { "de-file": "/exports/{orgUnitName}/{fileName}" },
            "http://localhost:8081/dhis2",
            parseDhis2Version("2.41.4")
        );

        expect(rows).toEqual([
            expect.objectContaining({
                id: "evt-1:de-file",
                eventOrgUnitId: "ou-a",
                eventOrgUnitName: "Central Clinic",
                fileDataValue: "file-123",
                fileDataValueUrl:
                    "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file",
                programStageId: undefined,
                programStageName: undefined,
                fileName: "visit-form.pdf",
                fileSize: 2048,
                resolvedTargetPath: "/exports/Central Clinic/visit-form.pdf",
                hasDuplicateTargetPath: false,
                isMissingFileResource: false,
            }),
        ]);
    });

    it("keeps rows with missing file resources and counts skipped files", () => {
        const rows = buildExportPreviewRows(
            [
                ProgramEventPreview.create({
                    id: "evt-2",
                    eventDate: "2026-01-11",
                    orgUnitId: "ou-a",
                    orgUnitName: "Central Clinic",
                    orgUnitAttributeValues: {},
                    dataValues: { "de-file": "missing-resource-value" },
                    attributeValues: {},
                    fileValues: { "de-file": "missing-resource-value" },
                    fileNames: {},
                    fileSizes: {},
                }),
            ],
            [
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "Visit Form",
                    valueType: "FILE_RESOURCE",
                    sourceType: "dataElement",
                }),
            ],
            { "de-file": "/exports/{fileName}" },
            "http://localhost:8081/dhis2"
        );

        const summary = summarizeExportPreview(rows);
        const firstRow = rows[0];

        expect(rows).toEqual([
            expect.objectContaining({
                id: "evt-2:de-file",
                fileDataValue: "missing-resource-value",
                fileResourceId: "missing-resource-value",
                fileName: undefined,
                resolvedTargetPath: undefined,
                hasDuplicateTargetPath: false,
                isMissingFileResource: true,
            }),
        ]);
        expect(firstRow).toBeDefined();
        if (!firstRow) {
            throw new Error("Expected preview row");
        }
        expect(getPreviewFileWarning(firstRow)).toBe(
            "Missing FileResource metadata for missing-resource-value"
        );
        expect(summary.totalFiles).toBe(0);
        expect(summary.totalSize).toBe(0);
        expect(summary.duplicateTargetPathDetails).toEqual([]);
        expect(summary.missingFileResourceCount).toBe(1);
    });

    it("summarizes totals and duplicate target paths", () => {
        const rows = buildExportPreviewRows(
            [
                ProgramEventPreview.create({
                    id: "evt-1",
                    eventDate: "2026-01-10",
                    orgUnitId: "ou-a",
                    orgUnitName: "Central Clinic",
                    orgUnitAttributeValues: {},
                    dataValues: { "de-file": "file-123", "de-file-b": "file-456" },
                    attributeValues: {},
                    fileValues: { "de-file": "file-123", "de-file-b": "file-456" },
                    fileNames: { "de-file": "visit-form.pdf", "de-file-b": "visit-form.pdf" },
                    fileSizes: { "de-file": 512, "de-file-b": 1536 },
                }),
            ],
            [
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "Visit Form",
                    valueType: "FILE_RESOURCE",
                    sourceType: "dataElement",
                }),
                ProgramFileProperty.create({
                    id: "de-file-b",
                    name: "Attachment",
                    valueType: "FILE_RESOURCE",
                    sourceType: "dataElement",
                }),
            ],
            {
                "de-file": "/exports/{fileName}",
                "de-file-b": "/exports/{fileName}",
            },
            "http://localhost:8081/dhis2"
        );

        const summary = summarizeExportPreview(rows);

        expect(summary.totalFiles).toBe(2);
        expect(summary.totalSize).toBe(2048);
        expect(summary.duplicateTargetPathDetails).toEqual([
            {
                path: "/exports/visit-form.pdf",
                rows: [
                    { eventId: "evt-1", fileDataValueName: "Visit Form" },
                    { eventId: "evt-1", fileDataValueName: "Attachment" },
                ],
            },
        ]);
        expect(summary.missingFileResourceCount).toBe(0);
        expect(rows.every(row => row.hasDuplicateTargetPath)).toBe(true);
    });

    it("marks all rows sharing a duplicate target path across different events", () => {
        const rows = buildExportPreviewRows(
            [
                ProgramEventPreview.create({
                    id: "evt-1",
                    eventDate: "2026-01-10",
                    orgUnitId: "ou-a",
                    orgUnitName: "Central Clinic",
                    orgUnitAttributeValues: {},
                    dataValues: { "de-file": "file-123" },
                    attributeValues: {},
                    fileValues: { "de-file": "file-123" },
                    fileNames: { "de-file": "report.pdf" },
                    fileSizes: { "de-file": 512 },
                }),
                ProgramEventPreview.create({
                    id: "evt-2",
                    eventDate: "2026-01-11",
                    orgUnitId: "ou-a",
                    orgUnitName: "Central Clinic",
                    orgUnitAttributeValues: {},
                    dataValues: { "de-file": "file-456" },
                    attributeValues: {},
                    fileValues: { "de-file": "file-456" },
                    fileNames: { "de-file": "report.pdf" },
                    fileSizes: { "de-file": 1024 },
                }),
            ],
            [
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "Visit Form",
                    valueType: "FILE_RESOURCE",
                    sourceType: "dataElement",
                }),
            ],
            { "de-file": "/exports/{orgUnitName}/{fileName}" },
            "http://localhost:8081/dhis2"
        );

        expect(rows).toHaveLength(2);
        expect(rows[0]?.hasDuplicateTargetPath).toBe(true);
        expect(rows[1]?.hasDuplicateTargetPath).toBe(true);

        const summary = summarizeExportPreview(rows);
        expect(summary.duplicateTargetPathDetails).toEqual([
            {
                path: "/exports/Central Clinic/report.pdf",
                rows: [
                    { eventId: "evt-1", fileDataValueName: "Visit Form" },
                    { eventId: "evt-2", fileDataValueName: "Visit Form" },
                ],
            },
        ]);
    });

    it("builds Capture event links", () => {
        expect(buildCaptureEventUrl("evt-1", "ou-b", "/dhis2")).toBe(
            "/dhis2/dhis-web-capture/index.html#/enrollmentEventEdit?eventId=evt-1&orgUnitId=ou-b"
        );
    });

    it("builds data value urls", () => {
        expect(
            buildEventDataValueUrl(
                "evt-1",
                "de-file",
                "http://localhost:8081/dhis2",
                parseDhis2Version("2.41.0")
            )
        ).toBe("http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file");
    });

    it("builds legacy data value urls for DHIS2 2.40", () => {
        expect(
            buildEventDataValueUrl(
                "evt-1",
                "de-file",
                "http://localhost:8081/dhis2",
                parseDhis2Version("2.40.7")
            )
        ).toBe("http://localhost:8081/dhis2/api/40/events/files?dataElementUid=de-file&eventUid=evt-1");
    });

    it("builds tracker data value urls for newer DHIS2 versions", () => {
        expect(
            buildEventDataValueUrl(
                "evt-1",
                "de-file",
                "http://localhost:8081/dhis2",
                parseDhis2Version("2.42.1")
            )
        ).toBe(
            "http://localhost:8081/dhis2/api/42/tracker/events/evt-1/dataValues/de-file/file"
        );
    });

    it("provides preview cell fallbacks", () => {
        expect(getPreviewCellValue("visit-form.pdf")).toBe("visit-form.pdf");
        expect(getPreviewCellValue("")).toBe("-");
        expect(getPreviewCellValue(undefined)).toBe("-");
    });

    it("formats file sizes for display", () => {
        expect(formatFileSize()).toBe("-");
        expect(formatFileSize(900)).toBe("900 B");
        expect(formatFileSize(2048)).toBe("2.0 KB");
        expect(formatFileSize(1048576)).toBe("1.0 MB");
    });
});
