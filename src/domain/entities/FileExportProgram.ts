import { Struct } from "$/domain/entities/generic/Struct";
import { Id, NamedRef } from "$/domain/entities/Ref";

export type ProgramType = "WITH_REGISTRATION" | "WITHOUT_REGISTRATION" | "UNKNOWN";

export type FileCapableProgramAttrs = {
    id: Id;
    name: string;
    programType: ProgramType;
    organisationUnits: NamedRef[];
};

export type FilePropertySourceType = "dataElement" | "trackedEntityAttribute" | "metadata";

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
    dataValues: Record<string, string>;
    fileValues: Record<string, string>;
    resolvedTemplate?: string;
};

export class FileCapableProgram extends Struct<FileCapableProgramAttrs>() {}

export class ProgramFileProperty extends Struct<ProgramFilePropertyAttrs>() {}

export class ProgramFilePropertyGroup extends Struct<ProgramFilePropertyGroupAttrs>() {}

export class ProgramFileProperties extends Struct<ProgramFilePropertiesAttrs>() {}

export class ProgramEventPreview extends Struct<ProgramEventPreviewAttrs>() {}
