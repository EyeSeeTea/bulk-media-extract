import React from "react";
import { ProgramEventsPreviewResult } from "$/domain/entities/FileExportProgram";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCachedAsyncData } from "$/webapp/hooks/useCachedAsyncData";

type Options = {
    enabled?: boolean;
};

/**
 * Loads event preview for selected program and organisation unit using cache.
 */
export function useProgramEventsPreview(
    programId: string,
    orgUnitId: string,
    orgUnitMode: "selected" | "descendants" = "selected",
    programStageId?: string,
    fileDataElementId?: string,
    options?: Options
) {
    const { compositionRoot } = useAppContext();
    const cacheKey = programId && orgUnitId
        ? `${programId}:${orgUnitId}:${orgUnitMode}:${programStageId ?? ""}:${fileDataElementId ?? ""}`
        : undefined;
    const enabled = options?.enabled ?? true;

    const asyncFunction = React.useCallback(async (): Promise<ProgramEventsPreviewResult> => {
        return compositionRoot.programs.getEventsPreview
            .execute(programId, orgUnitId, orgUnitMode, programStageId, fileDataElementId)
            .toPromise();
    }, [
        compositionRoot.programs.getEventsPreview,
        fileDataElementId,
        orgUnitId,
        orgUnitMode,
        programId,
        programStageId,
    ]);

    const { state, execute } = useCachedAsyncData(cacheKey, asyncFunction, {
        enabled: Boolean(programId && orgUnitId && enabled),
    });

    return {
        state,
        reload: execute,
    };
}
