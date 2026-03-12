import { NamedRef } from "$/domain/entities/Ref";
import { Struct } from "$/domain/entities/generic/Struct";
import { Id } from "$/domain/entities/Ref";
import { ProgramType } from "$/domain/entities/ProgramType";

export type FileCapableProgramAttrs = {
    id: Id;
    name: string;
    programType: ProgramType;
    organisationUnits: NamedRef[];
};

export class FileCapableProgram extends Struct<FileCapableProgramAttrs>() {}
