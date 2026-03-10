import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { WizardPage } from "./wizard/WizardPage";

export function Router() {
    return (
        <HashRouter>
            <Switch>
                <Route path="/wizard" render={() => <WizardPage />} />

                {/* Default route */}
                <Route render={() => <WizardPage />} />
            </Switch>
        </HashRouter>
    );
}
