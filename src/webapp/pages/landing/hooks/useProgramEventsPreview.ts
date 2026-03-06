import React from "react";
import { ProgramEventPreview } from "$/domain/entities/FileExportProgram";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCachedAsyncData } from "$/webapp/hooks/useCachedAsyncData";

/**
 * Loads event preview for selected program and organisation unit using cache.
 */
export function useProgramEventsPreview(programId: string, orgUnitId: string) {
    const { compositionRoot } = useAppContext();
    const cacheKey = programId && orgUnitId ? `${programId}:${orgUnitId}` : undefined;

    const asyncFunction = React.useCallback(async (): Promise<ProgramEventPreview[]> => {
        return compositionRoot.programs.getEventsPreview.execute(programId, orgUnitId).toPromise();
    }, [compositionRoot.programs.getEventsPreview, orgUnitId, programId]);

    const { state, execute } = useCachedAsyncData(cacheKey, asyncFunction, {
        enabled: Boolean(programId && orgUnitId),
    });

    return {
        state,
        reload: execute,
    };
}
