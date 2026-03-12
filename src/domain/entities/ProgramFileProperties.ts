import { FileCapableProgram } from "$/domain/entities/FileCapableProgram";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { ProgramFilePropertyGroup } from "$/domain/entities/ProgramFilePropertyGroup";
import { Struct } from "$/domain/entities/generic/Struct";

export type ProgramFilePropertiesAttrs = {
    program: FileCapableProgram;
    properties: ProgramFileProperty[];
    propertyGroups: ProgramFilePropertyGroup[];
};

export class ProgramFileProperties extends Struct<ProgramFilePropertiesAttrs>() {}
