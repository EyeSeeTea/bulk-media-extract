import React from "react";
import { useHistory } from "react-router-dom";
import { Button } from "@dhis2/ui";
import i18n from "$/utils/i18n";
import "./LandingPage.css";

export const LandingPage: React.FC = () => {
    const history = useHistory();

    return (
        <div className="landing-page">
            <div className="landing-page-card">
                <h1 className="landing-page-title">{i18n.t("File Export")}</h1>
                <p className="landing-page-subtitle">
                    {i18n.t("Export file data values from your programs to WebDAV or a local directory.")}
                </p>
                <Button primary large onClick={() => history.push("/wizard")}>
                    {i18n.t("Start new export")}
                </Button>
            </div>
        </div>
    );
};
