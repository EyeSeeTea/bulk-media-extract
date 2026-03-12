import { ExportPreviewRow } from "$/application/export/ExportPreview";

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

export function getPreviewCellValue(value?: string): string {
    return value?.trim() ? value : "-";
}

export function getPreviewFileWarning(row: ExportPreviewRow): string | undefined {
    if (!row.isMissingFileResource) {
        return undefined;
    }

    return row.fileResourceId
        ? `Missing FileResource metadata for ${row.fileResourceId}`
        : "Missing FileResource";
}
