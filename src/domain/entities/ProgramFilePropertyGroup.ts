import { Struct } from "$/domain/entities/generic/Struct";
import { FilePropertySourceType, ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";

export type ProgramFilePropertyGroupAttrs = {
    id: string;
    name: string;
    sourceType: FilePropertySourceType;
    properties: ProgramFileProperty[];
};

export class ProgramFilePropertyGroup extends Struct<ProgramFilePropertyGroupAttrs>() {}
