import { ProgramEventPreview, ProgramFileProperty } from "$/domain/entities/FileExportProgram";
import {
    getPropertyTemplateToken,
    insertAtCursor,
    resolveTemplateForEvent,
} from "$/webapp/pages/wizard/templateBuilder";
import { describe, expect, it } from "vitest";

describe("templateBuilder", () => {
    it("builds a placeholder token per property source type", () => {
        expect(
            getPropertyTemplateToken(
                ProgramFileProperty.create({
                    id: "orgUnitName",
                    name: "Org unit",
                    valueType: "TEXT",
                    sourceType: "metadata",
                })
            )
        ).toBe("{orgUnitName}");
        expect(
            getPropertyTemplateToken(
                ProgramFileProperty.create({
                    id: "orgUnitId",
                    name: "Org unit id",
                    valueType: "TEXT",
                    sourceType: "metadata",
                })
            )
        ).toBe("{orgUnitId}");
        expect(
            getPropertyTemplateToken(
                ProgramFileProperty.create({
                    id: "attr-photo",
                    name: "Photo",
                    valueType: "IMAGE",
                    sourceType: "trackedEntityAttribute",
                })
            )
        ).toBe("{attribute:attr-photo}");
        expect(
            getPropertyTemplateToken(
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "File",
                    valueType: "FILE_RESOURCE",
                    sourceType: "dataElement",
                })
            )
        ).toBe("{dataElement:de-file}");
    });

    it("inserts text at cursor", () => {
        const result = insertAtCursor("/reports/.pdf", "{orgUnitName}", 9, 9);
        expect(result.value).toBe("/reports/{orgUnitName}.pdf");
        expect(result.caret).toBe("/reports/{orgUnitName}".length);
    });

    it("resolves supported tokens using preview event data", () => {
        const event = ProgramEventPreview.create({
            id: "evt-1",
            eventDate: "2026-01-10",
            orgUnitId: "ou-a",
            orgUnitName: "Central Clinic",
            dataValues: { "de-file": "file-123" },
            fileValues: { "de-file": "file-123" },
        });

        const value = resolveTemplateForEvent(
            "/{orgUnitName}/{orgUnitId}/{enrollmentDate}/{dataElement:de-file}.pdf",
            event
        );
        expect(value).toBe("/Central Clinic/ou-a/2026-01-10/file-123.pdf");
    });
});
