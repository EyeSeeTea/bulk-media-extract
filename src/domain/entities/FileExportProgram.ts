import { Struct } from "$/domain/entities/generic/Struct";
import { Id, NamedRef } from "$/domain/entities/Ref";

export type ProgramType = "WITH_REGISTRATION" | "WITHOUT_REGISTRATION" | "UNKNOWN";

export type FileCapableProgramAttrs = {
    id: Id;
    name: string;
    programType: ProgramType;
    organisationUnits: NamedRef[];
};

export type FilePropertySourceType =
    | "dataElement"
    | "trackedEntityAttribute"
    | "metadata"
    | "organisationUnit"
    | "organisationUnitAttribute"
    | "event";

export type ProgramFilePropertyAttrs = {
    id: Id;
    name: string;
    valueType: string;
    sourceType: FilePropertySourceType;
    sourceContainerId?: Id;
    sourceContainerName?: string;
};

export type ProgramFilePropertyGroupAttrs = {
    id: string;
    name: string;
    sourceType: FilePropertySourceType;
    properties: ProgramFileProperty[];
};

export type ProgramFilePropertiesAttrs = {
    program: FileCapableProgram;
    properties: ProgramFileProperty[];
    propertyGroups: ProgramFilePropertyGroup[];
};

export type ProgramEventPreviewAttrs = {
    id: Id;
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

export type ProgramEventsPreviewResultAttrs = {
    events: ProgramEventPreview[];
    total?: number;
    pageCount?: number;
};

export class FileCapableProgram extends Struct<FileCapableProgramAttrs>() {}

export class ProgramFileProperty extends Struct<ProgramFilePropertyAttrs>() {}

export class ProgramFilePropertyGroup extends Struct<ProgramFilePropertyGroupAttrs>() {}

export class ProgramFileProperties extends Struct<ProgramFilePropertiesAttrs>() {}

export class ProgramEventPreview extends Struct<ProgramEventPreviewAttrs>() {}

export class ProgramEventsPreviewResult extends Struct<ProgramEventsPreviewResultAttrs>() {}
