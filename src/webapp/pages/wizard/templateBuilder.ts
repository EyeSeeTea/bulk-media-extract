import { ProgramEventPreview, ProgramFileProperty } from "$/domain/entities/FileExportProgram";

export function getPropertyTemplateToken(property: ProgramFileProperty): string {
    if (property.sourceType === "metadata") {
        return `{${property.id}}`;
    }

    if (property.sourceType === "trackedEntityAttribute") {
        return `{attribute:${sanitizeToken(property.id)}}`;
    }

    return `{dataElement:${sanitizeToken(property.id)}}`;
}

export function insertAtCursor(
    text: string,
    insertion: string,
    selectionStart?: number | null,
    selectionEnd?: number | null
): { value: string; caret: number } {
    const start = Math.max(0, selectionStart ?? text.length);
    const end = Math.max(start, selectionEnd ?? start);
    const value = `${text.slice(0, start)}${insertion}${text.slice(end)}`;
    return { value, caret: start + insertion.length };
}

export function resolveTemplateForEvent(template: string, event: ProgramEventPreview): string {
    return template.replace(/\{([^}]+)\}/g, (_value, token: string) => {
        if (token === "orgUnitName") {
            return event.orgUnitName ?? event.orgUnitId;
        }

        if (token === "orgUnitId") {
            return event.orgUnitId;
        }

        if (token === "enrollmentDate") {
            return event.eventDate ?? "";
        }

        if (token.startsWith("dataElement:")) {
            const key = token.slice("dataElement:".length);
            return event.dataValues[key] ?? event.fileValues[key] ?? "";
        }

        if (token.startsWith("attribute:")) {
            return "";
        }

        return "";
    });
}

function sanitizeToken(value: string): string {
    return value.trim().replace(/[^A-Za-z0-9_-]/g, "_");
}
