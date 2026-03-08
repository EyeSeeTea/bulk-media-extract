import React from "react";
import { ProgramEventPreview } from "$/domain/entities/FileExportProgram";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCachedAsyncData } from "$/webapp/hooks/useCachedAsyncData";

type Options = {
    enabled?: boolean;
};

/**
 * Loads event preview for selected program and organisation unit using cache.
 */
export function useProgramEventsPreview(programId: string, orgUnitId: string, options?: Options) {
    const { compositionRoot } = useAppContext();
    const cacheKey = programId && orgUnitId ? `${programId}:${orgUnitId}` : undefined;
    const enabled = options?.enabled ?? true;

    const asyncFunction = React.useCallback(async (): Promise<ProgramEventPreview[]> => {
        return compositionRoot.programs.getEventsPreview.execute(programId, orgUnitId).toPromise();
    }, [compositionRoot.programs.getEventsPreview, orgUnitId, programId]);

    const { state, execute } = useCachedAsyncData(cacheKey, asyncFunction, {
        enabled: Boolean(programId && orgUnitId && enabled),
    });

    return {
        state,
        reload: execute,
    };
}
