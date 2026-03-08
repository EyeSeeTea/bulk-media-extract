import { Struct } from "$/domain/entities/generic/Struct";
import { Id, NamedRef } from "$/domain/entities/Ref";

export type ProgramType = "WITH_REGISTRATION" | "WITHOUT_REGISTRATION" | "UNKNOWN";

export type FileCapableProgramAttrs = {
    id: Id;
    name: string;
    programType: ProgramType;
    organisationUnits: NamedRef[];
};

export type FilePropertySourceType = "dataElement" | "trackedEntityAttribute";

export type ProgramFilePropertyAttrs = {
    id: Id;
    name: string;
    valueType: string;
    sourceType: FilePropertySourceType;
    sourceContainerId?: Id;
    sourceContainerName?: string;
};

export type ProgramFilePropertiesAttrs = {
    program: FileCapableProgram;
    properties: ProgramFileProperty[];
};

export type ProgramEventPreviewAttrs = {
    id: Id;
    eventDate: string | null;
    orgUnitId: Id;
    orgUnitName?: string;
    fileValues: Record<string, string>;
};

export class FileCapableProgram extends Struct<FileCapableProgramAttrs>() {}

export class ProgramFileProperty extends Struct<ProgramFilePropertyAttrs>() {}

export class ProgramFileProperties extends Struct<ProgramFilePropertiesAttrs>() {}

export class ProgramEventPreview extends Struct<ProgramEventPreviewAttrs>() {}
