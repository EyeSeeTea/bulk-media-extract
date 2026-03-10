import { ReactNode } from "react";
import { render, RenderResult } from "@testing-library/react";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { createAdminUser } from "$/domain/entities/__tests__/userFixtures";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import { parseDhis2Version } from "$/webapp/utils/dhis2Version";

export function getTestContext(): AppContextState {
    return {
        currentUser: createAdminUser(),
        compositionRoot: getTestCompositionRoot(),
        baseUrl: "http://localhost:8081/dhis2",
        dhis2Version: parseDhis2Version("2.41.0"),
    };
}

export function getReactComponent(children: ReactNode, context: AppContextState = getTestContext()): RenderResult {

    return render(
        <AppContext.Provider value={context}>
            <SnackbarProvider>{children}</SnackbarProvider>
        </AppContext.Provider>
    );
}
