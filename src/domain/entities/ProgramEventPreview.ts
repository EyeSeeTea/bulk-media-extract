import { Id } from "$/domain/entities/Ref";
import { Struct } from "$/domain/entities/generic/Struct";

export type ProgramEventPreviewAttrs = {
    id: Id;
    programStageId?: Id;
    eventDate: string | null;
    orgUnitId: Id;
    orgUnitName?: string;
    orgUnitCode?: string;
    orgUnitShortName?: string;
    orgUnitPath?: string;
    orgUnitLevel?: number;
    orgUnitAttributeValues: Record<string, string>;
    dataValues: Record<string, string>;
    attributeValues: Record<string, string>;
    fileValues: Record<string, string>;
    fileNames: Record<string, string>;
    fileSizes?: Record<string, number>;
    resolvedTemplate?: string;
};

export class ProgramEventPreview extends Struct<ProgramEventPreviewAttrs>() {}
