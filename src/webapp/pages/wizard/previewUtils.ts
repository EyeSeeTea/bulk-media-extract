import { ProgramEventPreview, ProgramFileProperty } from "$/domain/entities/FileExportProgram";
import { resolveTemplateForEvent } from "$/webapp/pages/wizard/templateBuilder";

export type ExportPreviewRow = {
    id: string;
    eventId: string;
    eventDate: string | null;
    orgUnitLabel: string;
    fileDataValueId: string;
    fileDataValueName: string;
    fileResourceId: string;
    fileName: string;
    fileSize?: number;
    resolvedTargetPath: string;
    hasDuplicateTargetPath: boolean;
};

export type ExportPreviewSummary = {
    totalFiles: number;
    totalSize: number;
    duplicateTargetPaths: string[];
};

export function buildExportPreviewRows(
    events: ProgramEventPreview[],
    selectedFileDataElements: ProgramFileProperty[],
    mappingByFileKey: Record<string, string>
): ExportPreviewRow[] {
    const rows = events.flatMap(event => {
        return selectedFileDataElements.flatMap(fileProperty => {
            const fileResourceId = event.fileValues[fileProperty.id];
            if (!fileResourceId) {
                return [];
            }

            const fileName = event.fileNames[fileProperty.id] ?? fileResourceId;
            const resolvedTargetPath = resolveTemplateForEvent(
                mappingByFileKey[fileProperty.id] ?? "",
                event,
                fileProperty
            );

            return [
                {
                    id: `${event.id}:${fileProperty.id}`,
                    eventId: event.id,
                    eventDate: event.eventDate,
                    orgUnitLabel: event.orgUnitName ?? event.orgUnitId,
                    fileDataValueId: fileProperty.id,
                    fileDataValueName: fileProperty.name,
                    fileResourceId,
                    fileName,
                    fileSize: event.fileSizes?.[fileProperty.id],
                    resolvedTargetPath,
                    hasDuplicateTargetPath: false,
                },
            ];
        });
    });

    const duplicateCounts = rows.reduce<Map<string, number>>((acc, row) => {
        acc.set(row.resolvedTargetPath, (acc.get(row.resolvedTargetPath) ?? 0) + 1);
        return acc;
    }, new Map());

    return rows.map(row => ({
        ...row,
        hasDuplicateTargetPath: (duplicateCounts.get(row.resolvedTargetPath) ?? 0) > 1,
    }));
}

export function summarizeExportPreview(rows: ExportPreviewRow[]): ExportPreviewSummary {
    const duplicateTargetPaths = Array.from(
        rows.reduce<Set<string>>((acc, row) => {
            if (row.hasDuplicateTargetPath) {
                acc.add(row.resolvedTargetPath);
            }
            return acc;
        }, new Set())
    );

    return {
        totalFiles: rows.length,
        totalSize: rows.reduce((sum, row) => sum + (row.fileSize ?? 0), 0),
        duplicateTargetPaths,
    };
}

export function formatFileSize(size?: number): string {
    if (size === undefined) {
        return "-";
    }

    if (size < 1024) {
        return `${size} B`;
    }

    if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
