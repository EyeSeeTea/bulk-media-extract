import { ProgramEventPreview } from "$/domain/entities/ProgramEventPreview";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { ProgramFilePropertyGroup } from "$/domain/entities/ProgramFilePropertyGroup";

export function getPropertyTemplateToken(property: ProgramFileProperty): string {
    if (
        property.sourceType === "metadata" ||
        property.sourceType === "organisationUnit" ||
        property.sourceType === "event"
    ) {
        return `{${property.id}}`;
    }

    if (property.sourceType === "organisationUnitAttribute") {
        return `{orgUnitAttribute:${sanitizeToken(property.id)}}`;
    }

    if (property.sourceType === "trackedEntityAttribute") {
        return `{attribute:${sanitizeToken(property.id)}}`;
    }

    return `{dataElement:${sanitizeToken(property.id)}}`;
}

export function resolveTemplateForEvent(
    template: string,
    event: ProgramEventPreview,
    selectedFileProperty?: ProgramFileProperty
): string {
    const firstFileDataElementId = selectedFileProperty?.id ?? Object.keys(event.fileValues)[0] ?? "";
    const firstFileName = firstFileDataElementId
        ? event.fileNames[firstFileDataElementId] ?? ""
        : "";

    return template.replace(/\{([^}]+)\}/g, (_value, token: string) => {
        if (token === "orgUnitName") {
            return event.orgUnitName ?? event.orgUnitId;
        }

        if (token === "orgUnitId") {
            return event.orgUnitId;
        }

        if (token === "orgUnitCode") {
            return event.orgUnitCode ?? "";
        }

        if (token === "orgUnitShortName") {
            return event.orgUnitShortName ?? "";
        }

        if (token === "orgUnitPath") {
            return event.orgUnitPath ?? "";
        }

        if (token === "orgUnitLevel") {
            return event.orgUnitLevel !== undefined ? String(event.orgUnitLevel) : "";
        }

        if (token === "enrollmentDate") {
            return event.eventDate ?? "";
        }

        if (token === "fileName") {
            return firstFileName;
        }

        if (token === "fileExtension") {
            return getFileExtension(firstFileName);
        }

        if (token === "fileDataElementId") {
            return firstFileDataElementId;
        }

        if (token === "fileDataElementName") {
            return selectedFileProperty?.name ?? "";
        }

        if (token === "fileProgramStageId") {
            return selectedFileProperty?.sourceContainerId ?? "";
        }

        if (token === "fileProgramStageName") {
            return selectedFileProperty?.sourceContainerName ?? "";
        }

        if (token === "fileValueType") {
            return selectedFileProperty?.valueType ?? "";
        }

        if (token.startsWith("dataElement:")) {
            const key = token.slice("dataElement:".length);
            return event.dataValues[key] ?? event.fileValues[key] ?? "";
        }

        if (token.startsWith("attribute:")) {
            const key = token.slice("attribute:".length);
            return event.attributeValues[key] ?? "";
        }

        if (token.startsWith("orgUnitAttribute:")) {
            const key = token.slice("orgUnitAttribute:".length);
            return event.orgUnitAttributeValues[key] ?? "";
        }

        return "";
    });
}

export function buildFileMetadataPropertyGroup(
    selectedFileProperties: ProgramFileProperty[]
): ProgramFilePropertyGroup | undefined {
    if (selectedFileProperties.length === 0) {
        return undefined;
    }

    const properties: ProgramFileProperty[] = [
        ProgramFileProperty.create({
            id: "fileName",
            name: "Filename",
            valueType: "TEXT",
            sourceType: "metadata",
        }),
    ];

    if (
        selectedFileProperties.some(property => property.valueType) ||
        selectedFileProperties.some(property => property.name)
    ) {
        properties.push(
            ProgramFileProperty.create({
                id: "fileExtension",
                name: "File extension",
                valueType: "TEXT",
                sourceType: "metadata",
            })
        );
    }

    if (selectedFileProperties.some(property => property.id)) {
        properties.push(
            ProgramFileProperty.create({
                id: "fileDataElementId",
                name: "File data element id",
                valueType: "TEXT",
                sourceType: "metadata",
            })
        );
    }

    if (selectedFileProperties.some(property => property.name)) {
        properties.push(
            ProgramFileProperty.create({
                id: "fileDataElementName",
                name: "File data element name",
                valueType: "TEXT",
                sourceType: "metadata",
            })
        );
    }

    if (selectedFileProperties.some(property => property.sourceContainerId)) {
        properties.push(
            ProgramFileProperty.create({
                id: "fileProgramStageId",
                name: "File program stage id",
                valueType: "TEXT",
                sourceType: "metadata",
            })
        );
    }

    if (selectedFileProperties.some(property => property.sourceContainerName)) {
        properties.push(
            ProgramFileProperty.create({
                id: "fileProgramStageName",
                name: "File program stage name",
                valueType: "TEXT",
                sourceType: "metadata",
            })
        );
    }

    if (selectedFileProperties.some(property => property.valueType)) {
        properties.push(
            ProgramFileProperty.create({
                id: "fileValueType",
                name: "File value type",
                valueType: "TEXT",
                sourceType: "metadata",
            })
        );
    }

    return ProgramFilePropertyGroup.create({
        id: "fileMetadata",
        name: "File metadata",
        sourceType: "metadata",
        properties,
    });
}

function sanitizeToken(value: string): string {
    return value.trim().replace(/[^A-Za-z0-9_-]/g, "_");
}

function getFileExtension(fileName: string): string {
    const normalized = fileName.trim();
    const lastDot = normalized.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === normalized.length - 1) {
        return "";
    }

    return normalized.slice(lastDot + 1);
}
