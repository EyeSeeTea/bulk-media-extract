import React from "react";
import { NamedRef } from "$/domain/entities/Ref";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useAsyncData } from "$/webapp/hooks/useAsyncData";

/**
 * Loads organisation units used by the landing page preview selector.
 */
export function useOrganisationUnits() {
    const { compositionRoot } = useAppContext();

    const asyncFunction = React.useCallback(async (): Promise<NamedRef[]> => {
        return compositionRoot.programs.getOrganisationUnits.execute().toPromise();
    }, [compositionRoot.programs.getOrganisationUnits]);

    const { state, execute } = useAsyncData(asyncFunction, {
        autoExecute: true,
    });

    return {
        state,
        reload: execute,
    };
}
