import { ProgramEventPreview, ProgramFileProperty } from "$/domain/entities/FileExportProgram";
import {
    buildExportPreviewRows,
    formatFileSize,
    summarizeExportPreview,
} from "$/webapp/pages/wizard/previewUtils";
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
            { "de-file": "/exports/{orgUnitName}/{fileName}" }
        );

        expect(rows).toEqual([
            expect.objectContaining({
                id: "evt-1:de-file",
                fileName: "visit-form.pdf",
                fileSize: 2048,
                resolvedTargetPath: "/exports/Central Clinic/visit-form.pdf",
                hasDuplicateTargetPath: false,
            }),
        ]);
    });

    it("summarizes totals and duplicate target paths", () => {
        const rows = buildExportPreviewRows(
            [
                ProgramEventPreview.create({
                    id: "evt-1",
                    eventDate: "2026-01-10",
                    orgUnitId: "ou-a",
                    orgUnitName: "Central Clinic",
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
            }
        );

        const summary = summarizeExportPreview(rows);

        expect(summary.totalFiles).toBe(2);
        expect(summary.totalSize).toBe(2048);
        expect(summary.duplicateTargetPaths).toEqual(["/exports/visit-form.pdf"]);
        expect(rows.every(row => row.hasDuplicateTargetPath)).toBe(true);
    });

    it("formats file sizes for display", () => {
        expect(formatFileSize()).toBe("-");
        expect(formatFileSize(900)).toBe("900 B");
        expect(formatFileSize(2048)).toBe("2.0 KB");
        expect(formatFileSize(1048576)).toBe("1.0 MB");
    });
});
