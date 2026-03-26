import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { AppContextGuard } from "$/webapp/components/app-context-guard/AppContextGuard";
import { LandingPage } from "./landing/LandingPage";
import { WizardPage } from "./wizard/WizardPage";

export function Router() {
    return (
        <HashRouter>
            <Switch>
                <Route
                    path="/wizard"
                    render={() => (
                        <AppContextGuard>
                            <WizardPage />
                        </AppContextGuard>
                    )}
                />

                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
}
