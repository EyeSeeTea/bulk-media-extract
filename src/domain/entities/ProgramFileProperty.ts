import { Id } from "$/domain/entities/Ref";
import { Struct } from "$/domain/entities/generic/Struct";

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
    code?: string;
};

export class ProgramFileProperty extends Struct<ProgramFilePropertyAttrs>() {}
