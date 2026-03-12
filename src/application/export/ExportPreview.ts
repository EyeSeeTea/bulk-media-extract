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
