import React from "react";
import { useAppContext } from "$/webapp/contexts/app-context";
import { WizardContent } from "$/webapp/pages/wizard/WizardContent";
import { WizardProvider } from "$/webapp/pages/wizard/WizardContext";
import "./WizardPage.css";

export const WizardPage: React.FC = React.memo(() => {
    const { compositionRoot } = useAppContext();

    return (
        <WizardProvider
            validateStorageConnectionRequest={config =>
                compositionRoot.storage.validateConnection.execute(config).toPromise()
            }
        >
            <WizardContent />
        </WizardProvider>
    );
});
