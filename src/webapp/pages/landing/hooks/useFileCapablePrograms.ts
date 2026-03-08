import React from "react";
import { NamedRef } from "$/domain/entities/Ref";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useAsyncData } from "$/webapp/hooks/useAsyncData";

type ProgramOption = { id: string; name: string; organisationUnits: NamedRef[] };

/**
 * Loads file-capable programs for the landing page picker.
 */
export function useFileCapablePrograms() {
    const { compositionRoot } = useAppContext();

    const asyncFunction = React.useCallback(async (): Promise<ProgramOption[]> => {
        const programs = await compositionRoot.programs.getFileCapable.execute().toPromise();
        return programs.map(program => ({
            id: program.id,
            name: program.name,
            organisationUnits: program.organisationUnits,
        }));
    }, [compositionRoot.programs.getFileCapable]);

    const { state, execute } = useAsyncData(asyncFunction, {
        autoExecute: true,
    });

    return {
        state,
        reload: execute,
    };
}
