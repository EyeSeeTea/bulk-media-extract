import { FutureData } from "$/data/api-futures";
import { FileCapableProgram } from "$/domain/entities/FileCapableProgram";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { NamedRef } from "$/domain/entities/Ref";
import { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";

export interface ProgramRepository {
    getFileCapablePrograms(): FutureData<FileCapableProgram[]>;
    getProgramFileProperties(programId: string): FutureData<ProgramFileProperties>;
    getProgramEventsPreview(
        programId: string,
        orgUnitId: string,
        orgUnitMode: OrgUnitSelectionMode,
        programStageId: string | undefined,
        fileDataElementId: string | undefined,
        pageSize: number,
        loadAllPages?: boolean
    ): FutureData<ProgramEventsPreviewResult>;
    getOrganisationUnits(): FutureData<NamedRef[]>;
}
