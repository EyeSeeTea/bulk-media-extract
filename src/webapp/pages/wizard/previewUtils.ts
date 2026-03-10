import { ProgramEventPreview, ProgramFileProperty } from "$/domain/entities/FileExportProgram";
import {
    DEFAULT_DHIS2_VERSION,
    Dhis2Version,
    usesLegacyEventFileEndpoint,
} from "$/webapp/utils/dhis2Version";
import { resolveTemplateForEvent } from "$/webapp/pages/wizard/templateBuilder";

export type ExportPreviewRow = {
    id: string;
    eventId: string;
    eventOrgUnitId: string;
    eventOrgUnitName: string;
    fileDataValue: string;
    fileDataValueId: string;
    fileDataValueName: string;
    fileDataValueUrl: string;
    programStageId?: string;
    programStageName?: string;
    fileResourceId?: string;
    fileName?: string;
    fileSize?: number;
    resolvedTargetPath?: string;
    hasDuplicateTargetPath: boolean;
    isMissingFileResource: boolean;
};

export type ExportPreviewSummary = {
    totalFiles: number;
    totalSize: number;
    duplicateTargetPaths: string[];
    missingFileResourceCount: number;
};

export function buildExportPreviewRows(
    events: ProgramEventPreview[],
    selectedFileDataElements: ProgramFileProperty[],
    mappingByFileKey: Record<string, string>,
    baseUrl = getDhis2BaseUrl(),
    dhis2Version: Dhis2Version = DEFAULT_DHIS2_VERSION
): ExportPreviewRow[] {
    const rows = events.flatMap(event => {
        return selectedFileDataElements.flatMap(fileProperty => {
            const hasSelectedFileValue =
                Object.prototype.hasOwnProperty.call(event.dataValues, fileProperty.id) ||
                Object.prototype.hasOwnProperty.call(event.fileValues, fileProperty.id);
            if (!hasSelectedFileValue) {
                return [];
            }

            const fileResourceId = event.fileValues[fileProperty.id];
            const resolvedTargetPath = resolveTemplateForEvent(
                mappingByFileKey[fileProperty.id] ?? "",
                event,
                fileProperty
            );

            return [
                {
                    id: `${event.id}:${fileProperty.id}`,
                    eventId: event.id,
                    eventOrgUnitId: event.orgUnitId,
                    eventOrgUnitName: event.orgUnitName ?? event.orgUnitId,
                    fileDataValue: event.dataValues[fileProperty.id] ?? event.fileValues[fileProperty.id] ?? "",
                    fileDataValueId: fileProperty.id,
                    fileDataValueName: fileProperty.name,
                    fileDataValueUrl: buildEventDataValueUrl(
                        event.id,
                        fileProperty.id,
                        baseUrl,
                        dhis2Version
                    ),
                    programStageId: fileProperty.sourceContainerId,
                    programStageName: fileProperty.sourceContainerName,
                    fileResourceId,
                    fileName: event.fileNames[fileProperty.id],
                    fileSize: event.fileSizes?.[fileProperty.id],
                    resolvedTargetPath: event.fileNames[fileProperty.id] ? resolvedTargetPath : undefined,
                    hasDuplicateTargetPath: false,
                    isMissingFileResource: !fileResourceId || !event.fileNames[fileProperty.id],
                },
            ];
        });
    });

    const duplicateCounts = rows.reduce<Map<string, number>>((acc, row) => {
        const targetPath = row.resolvedTargetPath;
        if (!targetPath) {
            return acc;
        }
        acc.set(targetPath, (acc.get(targetPath) ?? 0) + 1);
        return acc;
    }, new Map());

    return rows.map(row => ({
        ...row,
        hasDuplicateTargetPath: row.resolvedTargetPath
            ? (duplicateCounts.get(row.resolvedTargetPath) ?? 0) > 1
            : false,
    }));
}

export function summarizeExportPreview(rows: ExportPreviewRow[]): ExportPreviewSummary {
    const duplicateTargetPaths = Array.from(
        rows.reduce<Set<string>>((acc, row) => {
            const targetPath = row.resolvedTargetPath;
            if (row.hasDuplicateTargetPath && targetPath) {
                acc.add(targetPath);
            }
            return acc;
        }, new Set())
    );

    return {
        totalFiles: rows.filter(row => !row.isMissingFileResource).length,
        totalSize: rows.reduce((sum, row) => sum + (row.fileSize ?? 0), 0),
        duplicateTargetPaths,
        missingFileResourceCount: rows.filter(row => row.isMissingFileResource).length,
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

export function buildCaptureEventUrl(
    eventId: string,
    orgUnitId: string,
    baseUrl = getDhis2BaseUrl()
): string {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
    const params = new URLSearchParams({
        eventId,
        orgUnitId,
    });

    return `${normalizedBaseUrl}/dhis-web-capture/index.html#/enrollmentEventEdit?${params.toString()}`;
}

export function buildEventDataValueUrl(
    eventId: string,
    dataElementId: string,
    baseUrl = getDhis2BaseUrl(),
    dhis2Version: Dhis2Version = DEFAULT_DHIS2_VERSION
): string {
    const normalizedBaseUrl = baseUrl.replace(/\/$/, "");

    if (usesLegacyEventFileEndpoint(dhis2Version)) {
        const params = new URLSearchParams({
            dataElementUid: dataElementId,
            eventUid: eventId,
        });

        return `${normalizedBaseUrl}/api/40/events/files?${params.toString()}`;
    }

    return `${normalizedBaseUrl}/api/${dhis2Version.minor}/tracker/events/${eventId}/dataValues/${dataElementId}/file`;
}

function getDhis2BaseUrl(): string {
    if (typeof document === "undefined") {
        return import.meta.env.DEV ? "/dhis2" : "";
    }

    const injectedBaseUrl = document
        .querySelector('meta[name="dhis2-base-url"]')
        ?.getAttribute("content");

    if (injectedBaseUrl && injectedBaseUrl !== "__DHIS2_BASE_URL__") {
        return injectedBaseUrl;
    }

    if (import.meta.env.DEV) {
        return "/dhis2";
    }

    return "";
}
