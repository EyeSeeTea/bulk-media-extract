import { FutureData } from "$/data/api-futures";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramFileProperties,
} from "$/domain/entities/FileExportProgram";
import { NamedRef } from "$/domain/entities/Ref";

export interface ProgramRepository {
    getFileCapablePrograms(): FutureData<FileCapableProgram[]>;
    getProgramFileProperties(programId: string): FutureData<ProgramFileProperties>;
    getProgramEventsPreview(programId: string, orgUnitId: string, pageSize: number): FutureData<ProgramEventPreview[]>;
    getOrganisationUnits(): FutureData<NamedRef[]>;
}
