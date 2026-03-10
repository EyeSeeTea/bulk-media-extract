import React from "react";
import { Button, CircularLoader, NoticeBox } from "@dhis2/ui";
import { StepIntro } from "$/webapp/pages/wizard/components/StepIntro";
import {
    StorageMethod,
    WizardLocalDirectoryStorageConfig,
    WizardWebDAVStorageConfig,
} from "$/webapp/pages/wizard/wizardConfig";
import i18n from "$/utils/i18n";

type StorageStepProps = {
    selectedMethod: StorageMethod;
    webdav: WizardWebDAVStorageConfig;
    localDirectory: WizardLocalDirectoryStorageConfig;
    onMethodChange: (method: StorageMethod) => void;
    onUrlChange: (value: string) => void;
    onUsernameChange: (value: string) => void;
    onPasswordChange: (value: string) => void;
    onValidateWebDAV: () => void;
    onChooseLocalDirectory: () => void;
    onValidateLocalDirectory: () => void;
};

export const StorageStep: React.FC<StorageStepProps> = ({
    selectedMethod,
    webdav,
    localDirectory,
    onMethodChange,
    onUrlChange,
    onUsernameChange,
    onPasswordChange,
    onValidateWebDAV,
    onChooseLocalDirectory,
    onValidateLocalDirectory,
}) => {
    const hasRequiredWebDAVValues = Boolean(webdav.url && webdav.username && webdav.password);
    const validateWebDAVButtonLabel =
        webdav.status === "validating"
            ? i18n.t("Testing connection...")
            : webdav.status === "valid"
              ? i18n.t("Retest connection")
              : i18n.t("Test connection");
    const validateLocalDirectoryButtonLabel =
        localDirectory.status === "validating"
            ? i18n.t("Validating directory...")
            : localDirectory.status === "valid"
              ? i18n.t("Revalidate directory")
              : i18n.t("Validate directory");

    return (
        <div className="wizard-step-content wizard-storage-step" aria-label="wizard-step-storage">
            <StepIntro
                title={i18n.t("Choose the export destination")}
                description={i18n.t(
                    "Select how the reviewed files should be written, then complete the setup for that destination."
                )}
            />

            <section className="wizard-section">
                <h4>{i18n.t("Storage method")}</h4>
                <p className="wizard-helper-text">
                    {i18n.t(
                        "You can switch between methods before execution. Only the selected method must be validated."
                    )}
                </p>
                <div className="wizard-storage-methods" role="radiogroup" aria-label="Storage method">
                    <button
                        type="button"
                        className={`wizard-storage-method-card ${
                            selectedMethod === "webdav" ? "is-selected" : ""
                        }`}
                        data-testid="wizard-storage-method-webdav"
                        aria-pressed={selectedMethod === "webdav"}
                        onClick={() => onMethodChange("webdav")}
                    >
                        <strong>{i18n.t("WebDAV")}</strong>
                        <span>{i18n.t("Connect to a remote WebDAV-compatible server.")}</span>
                    </button>
                    <button
                        type="button"
                        className={`wizard-storage-method-card ${
                            selectedMethod === "local-directory" ? "is-selected" : ""
                        }`}
                        data-testid="wizard-storage-method-local-directory"
                        aria-pressed={selectedMethod === "local-directory"}
                        onClick={() => onMethodChange("local-directory")}
                    >
                        <strong>{i18n.t("Local directory")}</strong>
                        <span>{i18n.t("Write files directly into a folder on this computer.")}</span>
                    </button>
                </div>
            </section>

            {selectedMethod === "webdav" ? (
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
                            value={webdav.url}
                            onChange={event => onUrlChange(event.target.value)}
                        />

                        <label className="field-label" htmlFor="wizard-storage-username">
                            {i18n.t("Username")}
                        </label>
                        <input
                            id="wizard-storage-username"
                            data-testid="wizard-storage-username"
                            type="text"
                            value={webdav.username}
                            onChange={event => onUsernameChange(event.target.value)}
                        />

                        <label className="field-label" htmlFor="wizard-storage-password">
                            {i18n.t("Password")}
                        </label>
                        <input
                            id="wizard-storage-password"
                            data-testid="wizard-storage-password"
                            type="password"
                            value={webdav.password}
                            onChange={event => onPasswordChange(event.target.value)}
                        />

                        <div className="actions-row wizard-storage-actions">
                            <Button
                                disabled={!hasRequiredWebDAVValues || webdav.status === "validating"}
                                onClick={onValidateWebDAV}
                            >
                                {validateWebDAVButtonLabel}
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
            ) : (
                <div className="wizard-storage-grid">
                    <section className="wizard-section">
                        <h4>{i18n.t("Destination directory")}</h4>
                        <p className="wizard-helper-text">
                            {i18n.t(
                                "Choose the local folder where the reviewed export paths will be created during this browser session."
                            )}
                        </p>

                        <div className="actions-row wizard-storage-actions">
                            <Button onClick={onChooseLocalDirectory}>
                                {localDirectory.directoryHandle
                                    ? i18n.t("Choose a different folder")
                                    : i18n.t("Choose folder")}
                            </Button>
                            <span
                                className="wizard-helper-text wizard-storage-action-hint"
                                data-testid="wizard-local-directory-name"
                            >
                                {localDirectory.directoryName
                                    ? i18n.t("Selected folder: {{name}}", {
                                          name: localDirectory.directoryName,
                                      })
                                    : i18n.t("No local folder selected yet.")}
                            </span>
                        </div>

                        <div className="actions-row wizard-storage-actions">
                            <Button
                                disabled={
                                    !localDirectory.directoryHandle ||
                                    localDirectory.status === "validating"
                                }
                                onClick={onValidateLocalDirectory}
                            >
                                {validateLocalDirectoryButtonLabel}
                            </Button>
                            <span className="wizard-helper-text wizard-storage-action-hint">
                                {i18n.t("Validate the selected folder before continuing to execution.")}
                            </span>
                        </div>
                    </section>

                    <NoticeBox title={i18n.t("Local directory setup")} dataTest="wizard-storage-local-setup">
                        <p>
                            {i18n.t(
                                "Local directory export writes files directly into a folder on this computer instead of sending them to a remote server."
                            )}
                        </p>
                        <ul className="wizard-storage-checklist">
                            <li>
                                {i18n.t(
                                    "This option requires browser support for the File System Access API, which is typically available in Chromium-based browsers."
                                )}
                            </li>
                            <li>
                                {i18n.t(
                                    "Folder access applies only to the current browser session. If you reload the app, choose the folder again."
                                )}
                            </li>
                            <li>
                                {i18n.t(
                                    "The export will recreate the reviewed folder structure under the selected local directory."
                                )}
                            </li>
                        </ul>
                    </NoticeBox>
                </div>
            )}

            {selectedMethod === "webdav" && webdav.status === "validating" ? (
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
            {selectedMethod === "webdav" && webdav.status === "valid" ? (
                <NoticeBox title={i18n.t("Connection valid")}>
                    {i18n.t("WebDAV connection validated. You can continue to execution.")}
                </NoticeBox>
            ) : null}
            {selectedMethod === "webdav" && webdav.error ? (
                <NoticeBox error title={i18n.t("Connection invalid")}>
                    {webdav.error} {i18n.t("Review the setup remarks above and try again.")}
                </NoticeBox>
            ) : null}

            {selectedMethod === "local-directory" && localDirectory.status === "validating" ? (
                <NoticeBox title={i18n.t("Validating directory")}>
                    <div className="wizard-inline-loader">
                        <CircularLoader small />
                        <span>
                            {i18n.t(
                                "Checking whether this browser session can write files into the selected local directory."
                            )}
                        </span>
                    </div>
                </NoticeBox>
            ) : null}
            {selectedMethod === "local-directory" && localDirectory.status === "valid" ? (
                <NoticeBox title={i18n.t("Directory valid")}>
                    {i18n.t("Local directory validated. You can continue to execution.")}
                </NoticeBox>
            ) : null}
            {selectedMethod === "local-directory" && localDirectory.error ? (
                <NoticeBox error title={i18n.t("Directory invalid")}>
                    {localDirectory.error}{" "}
                    {i18n.t("Choose a supported browser or select a different folder and try again.")}
                </NoticeBox>
            ) : null}
        </div>
    );
};
