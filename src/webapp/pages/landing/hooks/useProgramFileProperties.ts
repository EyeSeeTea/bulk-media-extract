import React from "react";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCachedAsyncData } from "$/webapp/hooks/useCachedAsyncData";

/**
 * Loads selected program file properties using in-memory cache by program id.
 */
export function useProgramFileProperties(programId: string) {
    const { compositionRoot } = useAppContext();

    const asyncFunction = React.useCallback(async (): Promise<ProgramFileProperties> => {
        return compositionRoot.programs.getFileProperties.execute(programId).toPromise();
    }, [compositionRoot.programs.getFileProperties, programId]);

    const { state } = useCachedAsyncData(programId, asyncFunction, {
        enabled: Boolean(programId),
    });

    return { state };
}
