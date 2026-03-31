import React, { useContext } from "react";
import { CircularLoader } from "@dhis2/ui";
import { AppContext } from "$/webapp/contexts/app-context";

/**
 * Renders `children` only after AppContext has been initialized.
 * Displays a centered loading indicator while initialization is in progress.
 *
 * Use this to wrap routes or components that depend on AppContext (e.g. the wizard),
 * while allowing context-free pages (e.g. the landing page) to render immediately.
 */
export function AppContextGuard(props: { children: React.ReactNode }) {
    const appContext = useContext(AppContext);

    if (!appContext) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "60vh",
                }}
            >
                <CircularLoader />
            </div>
        );
    }

    return <>{props.children}</>;
}
