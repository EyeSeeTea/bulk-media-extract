import { ProgramEventPreview, ProgramFileProperty } from "$/domain/entities/FileExportProgram";
import {
    buildFileMetadataPropertyGroup,
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
            attributeValues: { "attr-photo": "photo-001.jpg" },
            fileValues: { "de-file": "file-123" },
            fileNames: { "de-file": "visit-form.pdf" },
        });
        const selectedFileProperty = ProgramFileProperty.create({
            id: "de-file",
            name: "Visit Form",
            valueType: "FILE_RESOURCE",
            sourceType: "dataElement",
            sourceContainerId: "stage-1",
            sourceContainerName: "Main Stage",
        });

        const value = resolveTemplateForEvent(
            "/{orgUnitName}/{orgUnitId}/{enrollmentDate}/{dataElement:de-file}/{attribute:attr-photo}/{fileName}/{fileDataElementId}/{fileDataElementName}/{fileProgramStageId}/{fileProgramStageName}/{fileValueType}.pdf",
            event,
            selectedFileProperty
        );
        expect(value).toBe(
            "/Central Clinic/ou-a/2026-01-10/file-123/photo-001.jpg/visit-form.pdf/de-file/Visit Form/stage-1/Main Stage/FILE_RESOURCE.pdf"
        );
    });

    it("builds file metadata property group from selected file data elements", () => {
        const group = buildFileMetadataPropertyGroup([
            ProgramFileProperty.create({
                id: "de-file",
                name: "Visit Form",
                valueType: "FILE_RESOURCE",
                sourceType: "dataElement",
                sourceContainerId: "stage-1",
                sourceContainerName: "Main Stage",
            }),
        ]);

        expect(group?.id).toBe("fileMetadata");
        expect(group?.properties.map(property => property.id)).toEqual(
            expect.arrayContaining([
                "fileName",
                "fileDataElementId",
                "fileDataElementName",
                "fileProgramStageId",
                "fileProgramStageName",
                "fileValueType",
            ])
        );
    });
});
