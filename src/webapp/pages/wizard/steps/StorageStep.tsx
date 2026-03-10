import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { StepIntro } from "$/webapp/pages/wizard/components/StepIntro";
import { WizardConnectionStatus } from "$/webapp/pages/wizard/wizardConfig";
import i18n from "$/utils/i18n";

type StorageStepProps = {
    url: string;
    username: string;
    password: string;
    connectionStatus: WizardConnectionStatus;
    connectionError?: string;
    onUrlChange: (value: string) => void;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onValidate: () => void;
};

export const StorageStep: React.FC<StorageStepProps> = ({
    url,
    username,
    password,
    connectionStatus,
    connectionError,
    onUrlChange,
    onUsernameChange,
    onPasswordChange,
    onValidate,
}) => {
    const hasRequiredValues = Boolean(url && username && password);
    const validateButtonLabel =
        connectionStatus === "validating"
            ? i18n.t("Testing connection...")
            : connectionStatus === "valid"
              ? i18n.t("Retest connection")
              : i18n.t("Test connection");

    return (
        <div className="wizard-step-content wizard-storage-step" aria-label="wizard-step-storage">
            <StepIntro
                title={i18n.t("Validate the WebDAV destination")}
                description={i18n.t(
                    "Confirm that the browser can reach the target WebDAV endpoint before running the export."
                )}
            />
            <div className="wizard-storage-grid">
                <section className="wizard-section">
                    <h4>{i18n.t("Connection details")}</h4>
                    <p className="wizard-helper-text">
                        {i18n.t(
                            "Enter the WebDAV endpoint URL and credentials that the browser will use during export."
                        )}
                    </p>

                    <label className="field-label" htmlFor="wizard-storage-url">
                        {i18n.t("WebDAV URL")}
                    </label>
                    <input
                        id="wizard-storage-url"
                        data-testid="wizard-storage-url"
                        type="text"
                        placeholder="https://storage.example.org/remote.php/dav/files/user"
                        value={url}
                        onChange={event => onUrlChange(event.target.value)}
                    />

                    <label className="field-label" htmlFor="wizard-storage-username">
                        {i18n.t("Username")}
                    </label>
                    <input
                        id="wizard-storage-username"
                        data-testid="wizard-storage-username"
                        type="text"
                        value={username}
                        onChange={event => onUsernameChange(event.target.value)}
                    />

                    <label className="field-label" htmlFor="wizard-storage-password">
                        {i18n.t("Password")}
                    </label>
                    <input
                        id="wizard-storage-password"
                        data-testid="wizard-storage-password"
                        type="password"
                        value={password}
                        onChange={event => onPasswordChange(event.target.value)}
                    />

                    <div className="actions-row wizard-storage-actions">
                        <Button
                            disabled={!hasRequiredValues || connectionStatus === "validating"}
                            onClick={onValidate}
                        >
                            {validateButtonLabel}
                        </Button>
                        <span className="wizard-helper-text wizard-storage-action-hint">
                            {i18n.t("You must pass this test before continuing to execution.")}
                        </span>
                    </div>
                </section>

                <NoticeBox title={i18n.t("Storage setup")} dataTest="wizard-storage-setup">
                    <p>
                        {i18n.t(
                            "Use a WebDAV-compatible storage service such as ownCloud, Nextcloud, or another WebDAV-enabled server."
                        )}
                    </p>
                    <ul className="wizard-storage-checklist">
                        <li>
                            {i18n.t(
                                "Use the direct WebDAV endpoint, not a generic product homepage or login page."
                            )}
                        </li>
                        <li>
                            {i18n.t(
                                "The WebDAV server must allow cross-origin requests from this app origin (CORS) or the browser will block validation and file transfer."
                            )}
                        </li>
                        <li>
                            {i18n.t(
                                "If your server sits behind a proxy or self-signed TLS setup, make sure the browser can reach it successfully from this environment."
                            )}
                        </li>
                    </ul>
                </NoticeBox>
            </div>

            {connectionStatus === "validating" ? (
                <NoticeBox title={i18n.t("Testing connection")}>
                    <div className="wizard-inline-loader">
                        <CircularLoader small />
                        <span>
                            {i18n.t(
                                "Checking whether this browser can reach the WebDAV endpoint with the provided credentials."
                            )}
                        </span>
                    </div>
                </NoticeBox>
            ) : null}
            {connectionStatus === "valid" ? (
                <NoticeBox title={i18n.t("Connection valid")}>
                    {i18n.t("WebDAV connection validated. You can continue to execution.")}
                </NoticeBox>
            ) : null}
            {connectionError ? (
                <NoticeBox error title={i18n.t("Connection invalid")}>
                    {connectionError} {i18n.t("Review the setup remarks above and try again.")}
                </NoticeBox>
            ) : null}
        </div>
    );
};
