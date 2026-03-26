import React from "react";
import { HashRouter, Route, Switch } from "react-router-dom";
import { LandingPage } from "./landing/LandingPage";
import { WizardPage } from "./wizard/WizardPage";

export function Router() {
    return (
        <HashRouter>
            <Switch>
                <Route path="/wizard" render={() => <WizardPage />} />

                {/* Default route */}
                <Route render={() => <LandingPage />} />
            </Switch>
        </HashRouter>
    );
}
