import React, { useEffect, useState } from "react";
import { HeaderBar } from "@dhis2/ui";
import { SnackbarProvider } from "@eyeseetea/d2-ui-components";
import { Feedback } from "@eyeseetea/feedback-component";
import { appConfig } from "$/app-config";
import { CompositionRoot } from "$/CompositionRoot";
import { Share } from "$/webapp/components/share/Share";
import { AppContext, AppContextState } from "$/webapp/contexts/app-context";
import { Router } from "$/webapp/pages/Router";
import "./App.css";

type AppProps = {
    compositionRoot: CompositionRoot;
    baseUrl: string;
};

function App_(props: AppProps) {
    const { compositionRoot, baseUrl } = props;
    const [showShareButton, setShowShareButton] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appContext, setAppContext] = useState<AppContextState | null>(null);

    useEffect(() => {
        async function setup() {
            const isShareButtonVisible = appConfig.appearance.showShareButton;
            const currentUser = await compositionRoot.users.getCurrent.execute().toPromise();
            if (!currentUser) throw new Error("User not logged in");

            setAppContext({ currentUser, compositionRoot, baseUrl });
            setShowShareButton(isShareButtonVisible);
            setLoading(false);
        }
        setup();
    }, [baseUrl, compositionRoot]);

    if (loading) return null;

    return (
        <SnackbarProvider>
            <HeaderBar appName="Skeleton App" />

            {appConfig.feedback && appContext && (
                <Feedback options={appConfig.feedback} username={appContext.currentUser.username} />
            )}

            <div id="app" className="content">
                <AppContext.Provider value={appContext}>
                    <Router />
                </AppContext.Provider>
            </div>

            <Share visible={showShareButton} />
        </SnackbarProvider>
    );
}

export const App = React.memo(App_);
