import React, { useContext } from "react";
import { CompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { Dhis2Version } from "$/webapp/utils/dhis2Version";

export type AppContextState = {
    currentUser: User;
    compositionRoot: CompositionRoot;
    baseUrl: string;
    dhis2Version: Dhis2Version;
};

export const AppContext = React.createContext<AppContextState | null>(null);

export function useAppContext() {
    const context = useContext(AppContext);
    if (context) {
        return context;
    } else {
        throw new Error("App context uninitialized");
    }
}
