import { FutureData } from "$/data/api-futures";
import {
    FileCapableProgram,
    ProgramEventsPreviewResult,
    ProgramFileProperties,
} from "$/domain/entities/FileExportProgram";
import { NamedRef } from "$/domain/entities/Ref";

export interface ProgramRepository {
    getFileCapablePrograms(): FutureData<FileCapableProgram[]>;
    getProgramFileProperties(programId: string): FutureData<ProgramFileProperties>;
    getProgramEventsPreview(
        programId: string,
        orgUnitId: string,
        orgUnitMode: "selected" | "descendants",
        programStageId: string | undefined,
        fileDataElementId: string | undefined,
        pageSize: number,
        loadAllPages?: boolean
    ): FutureData<ProgramEventsPreviewResult>;
    getOrganisationUnits(): FutureData<NamedRef[]>;
}
