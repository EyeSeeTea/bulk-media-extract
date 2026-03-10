import { fireEvent, waitFor, within } from "@testing-library/react";
import { Future } from "$/domain/entities/generic/Future";
import { getReactComponent, getTestContext } from "$/utils/tests";
import { WizardPage } from "$/webapp/pages/wizard/WizardPage";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker", () => ({
    OrgUnitTreePicker: (props: {
        programOrgUnits: Array<{ id: string; name: string; path?: string }>;
        onChange: (selection: { id: string; name?: string }) => void;
    }) => (
        <button
            type="button"
            data-testid="org-unit-tree-picker"
            onClick={() =>
                props.onChange({
                    id: props.programOrgUnits[0]?.id ?? "",
                    name: props.programOrgUnits[0]?.name,
                })
            }
        >
            Mock org unit tree
        </button>
    ),
}));

afterEach(() => {
    vi.restoreAllMocks();
});

function mockSourceDownloads() {
    return vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
        return new Response(new Blob(["file-content"], { type: "application/pdf" }), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
            },
        });
    });
}

function expectCurrentStep(page: ReturnType<typeof getReactComponent>, stepId: string) {
    expect(page.getByTestId(`wizard-step-tab-${stepId}`)).toHaveAttribute("aria-current", "step");
}

describe("WizardPage", () => {
    it("blocks next when program is not selected", () => {
        const page = getReactComponent(<WizardPage />);

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Program is required.")).toBeInTheDocument();
        expectCurrentStep(page, "program");
        expect(page.queryByText("Step 1 of 5: Program")).not.toBeInTheDocument();
    });

    it("renders the redesigned program step hierarchy and summary", async () => {
        const page = getReactComponent(<WizardPage />);

        expectCurrentStep(page, "program");
        expect(page.getByText("Choose a program and the files to export")).toBeInTheDocument();
        expect(
            page.getByText(
                "Start by selecting the tracker program. Then confirm which file data values should move forward to template setup and preview."
            )
        ).toBeInTheDocument();
        expect(page.queryByText("Program summary")).not.toBeInTheDocument();

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });

        expect(await page.findByText("Program summary")).toBeInTheDocument();
        expect(await page.findByTestId("wizard-program-summary")).toBeInTheDocument();
        expect(page.getByText("Tracker Program")).toBeInTheDocument();
        expect(page.getByText("Selected: 0 of 2")).toBeInTheDocument();

        fireEvent.click(page.getByTestId("wizard-file-select-de-file"));

        expect(page.getByText("Selected: 1 of 2")).toBeInTheDocument();
        expect(page.getByText("Visit Form")).toBeInTheDocument();
        expect(page.getAllByText("Main Stage").length).toBeGreaterThan(0);
        expect(page.getByTestId("wizard-step-number-program").textContent).toContain("1");
    });

    it("preserves template step filters when navigating back from preview", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));

        fireEvent.click(page.getByText("Next"));
        expectCurrentStep(page, "template");
        expect(page.getByText("Path and filename template - Visit Form")).toBeInTheDocument();

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-org-unit-mode"), { target: { value: "selected" } });
        fireEvent.change(page.getByTestId("wizard-date-from"), { target: { value: "2026-01-01" } });
        fireEvent.change(page.getByTestId("wizard-date-to"), { target: { value: "2026-01-31" } });
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });

        fireEvent.click(page.getByText("Next"));
        expectCurrentStep(page, "preview");

        fireEvent.click(page.getByText("Back"));
        expectCurrentStep(page, "template");
        expect(page.getByTestId("org-unit-tree-picker")).toBeInTheDocument();
        expect((page.getByTestId("wizard-org-unit-mode") as HTMLSelectElement).value).toBe("selected");
        expect((page.getByTestId("wizard-date-from") as HTMLInputElement).value).toBe("2026-01-01");
        expect((page.getByTestId("wizard-date-to") as HTMLInputElement).value).toBe("2026-01-31");
        expect((page.getByTestId("wizard-template-input") as HTMLTextAreaElement).value).toBe(
            "/exports/{fileName}"
        );
    });

    it("supports preview, storage validation, and successful execution", async () => {
        mockSourceDownloads();
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-date-from"), { target: { value: "2026-01-01" } });
        fireEvent.change(page.getByTestId("wizard-date-to"), { target: { value: "2026-01-31" } });
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{orgUnitName}/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        expectCurrentStep(page, "preview");
        const summary = page.getByTestId("wizard-preview-summary");
        expect(summary.textContent).toContain("Program");
        expect(summary.textContent).toContain("Antenatal Visit");
        expect(summary.textContent).toContain("Selected file data elements");
        expect(summary.textContent).toContain("Visit Form");
        expect(summary.textContent).toContain("/exports/{orgUnitName}/{fileName}");
        expect(summary.textContent).toContain("Org unit");
        expect(summary.textContent).toContain("Central Clinic");
        expect(summary.textContent).toContain("Org unit mode");
        const programText = within(summary).getByText("Antenatal Visit");
        const mappingText = within(summary).getByText("Visit Form");
        const orgUnitText = within(summary).getByText("Central Clinic");
        const modeText = within(summary).getByText("Descendants");
        expect(programText.compareDocumentPosition(mappingText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(mappingText.compareDocumentPosition(orgUnitText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(orgUnitText.compareDocumentPosition(modeText)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

        const table = page.getByTestId("wizard-preview-table");
        expect(within(table).queryByText("Date")).not.toBeInTheDocument();
        expect(within(table).queryByText("Target filepath")).not.toBeInTheDocument();
        expect(page.getByText("/exports/Central Clinic/visit-form.pdf")).toBeInTheDocument();
        const eventLink = page.getByRole("link", { name: "evt-1" }) as HTMLAnchorElement;
        expect(eventLink).toHaveClass("wizard-preview-event-link");
        expect(eventLink.href).toContain(
            "/dhis2/dhis-web-capture/index.html#/enrollmentEventEdit?eventId=evt-1&orgUnitId=ou-a"
        );
        const footer = page.getByTestId("wizard-preview-footer");
        expect(table.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(page.getByText("Files")).toBeInTheDocument();
        expect(page.getAllByText("1.0 KB").length).toBeGreaterThan(0);

        fireEvent.click(page.getByText("Next"));
        expectCurrentStep(page, "storage");

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));

        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        expectCurrentStep(page, "execution");
        expect(page.getByText("Finish")).toBeInTheDocument();
        expect(page.getByText("Finish")).toBeEnabled();
        expect(page.queryByTestId("wizard-execution-progress-panel")).not.toBeInTheDocument();
        expect(page.queryByTestId("wizard-execution-log")).not.toBeInTheDocument();
        fireEvent.click(page.getByText("Start export"));

        await waitFor(() => {
            expect(page.getByText("All files processed successfully.")).toBeInTheDocument();
        });
        expect(page.getByTestId("wizard-execution-stat-pair-throughput").textContent).toContain("Processed");
        expect(page.getByTestId("wizard-execution-stat-pair-throughput").textContent).toContain("Progress");
        expect(page.getByTestId("wizard-execution-stat-pair-outcome").textContent).toContain("Successes");
        expect(page.getByTestId("wizard-execution-stat-pair-outcome").textContent).toContain("Failures");
        expect(page.getByTestId("wizard-execution-stats").textContent).toContain("1/1");
        expect(page.getByTestId("wizard-execution-progress-panel")).toBeInTheDocument();
        expect(page.getByTestId("wizard-execution-progress-bar")).toHaveAttribute("aria-valuenow", "100");
        const executionLog = page.getByTestId("wizard-execution-log");
        expect(executionLog).not.toHaveAttribute("open");
        expect(within(executionLog).getByText("3 entries")).toBeInTheDocument();
        fireEvent.click(page.getByTestId("wizard-execution-log-toggle"));
        expect(executionLog).toHaveAttribute("open");
        expect(page.getByTestId("wizard-execution-log").querySelector(".wizard-execution-log-list")).not.toBeNull();
        expect(within(executionLog).getByText("Export started with 1 file to process.")).toBeInTheDocument();
        expect(within(executionLog).getByText("/exports/Central Clinic/visit-form.pdf")).toBeInTheDocument();
        expect(page.queryByText("Latest target path: /exports/Central Clinic/visit-form.pdf")).not.toBeInTheDocument();
        expect(page.getByText("Download result summary")).toBeInTheDocument();
        expect(page.getByText("Finish")).toBeEnabled();
    });

    it("shows partial failure state and retry action when uploads fail", async () => {
        mockSourceDownloads();
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByTestId("wizard-file-select-de-file-b"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.change(page.getByTestId("wizard-template-input-de-file-b"), {
            target: { value: "/exports/fail-{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));
        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        fireEvent.click(page.getByText("Next"));
        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));
        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByText("Start export"));
        expect(page.getByText("Finish")).toBeDisabled();

        await waitFor(() => {
            expect(page.getByText("Export completed with failures")).toBeInTheDocument();
        });
        expect(page.getByText("Execution finished with 1 failed transfers.")).toBeInTheDocument();
        expect(page.getByTestId("wizard-execution-stats").textContent).toContain("2/2");
        fireEvent.click(page.getByTestId("wizard-execution-log-toggle"));
        expect(page.getByText("Upload failed for /exports/fail-consent-form.pdf")).toBeInTheDocument();
        expect(page.getByText("Retry export")).toBeInTheDocument();
        expect(page.getByText("Download result summary")).toBeInTheDocument();
        expect(page.getByText("Finish")).toBeEnabled();
    });

    it("downloads the execution result summary after a completed run", async () => {
        mockSourceDownloads();
        const page = getReactComponent(<WizardPage />);
        let downloadedBlob: Blob | undefined;
        const createObjectURLSpy = vi.fn((blob: Blob | MediaSource) => {
            downloadedBlob = blob as Blob;
            return "blob:execution-report";
        });
        const revokeObjectURLSpy = vi.fn(() => undefined);
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            writable: true,
            value: createObjectURLSpy,
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            writable: true,
            value: revokeObjectURLSpy,
        });
        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => undefined);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));
        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        fireEvent.click(page.getByText("Next"));
        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));
        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByText("Start export"));

        try {
            await page.findByText("All files processed successfully.");
            fireEvent.click(page.getByText("Download result summary"));

            await waitFor(() => {
                expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
            });

            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:execution-report");
            expect(downloadedBlob).toBeInstanceOf(Blob);
            expect((downloadedBlob as Blob).type).toBe("application/json");
        } finally {
            Object.defineProperty(URL, "createObjectURL", {
                configurable: true,
                writable: true,
                value: originalCreateObjectURL,
            });
            Object.defineProperty(URL, "revokeObjectURL", {
                configurable: true,
                writable: true,
                value: originalRevokeObjectURL,
            });
        }
    });

    it("allows interrupting a running execution and preserves a partial summary", async () => {
        mockSourceDownloads();
        const context = getTestContext();
        const uploadSpy = vi
            .spyOn(context.compositionRoot.storage.uploadFile, "execute")
            .mockImplementation(() =>
                Future.fromComputation<Error, void>((resolve, _reject) => {
                    const timeoutId = setTimeout(() => resolve(undefined), 200);
                    return () => clearTimeout(timeoutId);
                })
            );
        const page = getReactComponent(<WizardPage />, context);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));
        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        fireEvent.click(page.getByText("Next"));
        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));
        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByText("Start export"));
        expect(await page.findByText("Interrupt export")).toBeInTheDocument();
        fireEvent.click(page.getByText("Interrupt export"));

        await waitFor(() => {
            expect(page.getByText("Export interrupted")).toBeInTheDocument();
        });
        expect(page.getByText("Execution was interrupted before all transfers completed.")).toBeInTheDocument();
        const executionLog = page.getByTestId("wizard-execution-log");
        expect(executionLog).not.toHaveAttribute("open");
        fireEvent.click(page.getByTestId("wizard-execution-log-toggle"));
        expect(within(executionLog).getByText("Export interrupted after 0 of 1 file.")).toBeInTheDocument();
        expect(page.getByText("Download result summary")).toBeInTheDocument();
        expect(page.getByText("Finish")).toBeEnabled();
        expect(uploadSpy).toHaveBeenCalledTimes(1);
    });

    it("shows WebDAV guidance and blocks storage progression before successful validation", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));
        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();

        fireEvent.click(page.getByText("Next"));
        expectCurrentStep(page, "storage");
        const storageSetup = page.container.querySelector('[data-test="wizard-storage-setup"]');
        expect(storageSetup).not.toBeNull();
        expect(
            within(storageSetup as HTMLElement).getByText(
                "Use a WebDAV-compatible storage service such as ownCloud, Nextcloud, or another WebDAV-enabled server."
            )
        ).toBeInTheDocument();
        expect(
            within(storageSetup as HTMLElement).getByText(
                "Use the direct WebDAV endpoint, not a generic product homepage or login page."
            )
        ).toBeInTheDocument();
        expect(
            within(storageSetup as HTMLElement).getByText(
                "The WebDAV server must allow cross-origin requests from this app origin (CORS) or the browser will block validation and file transfer."
            )
        ).toBeInTheDocument();
        expect(page.queryByText("WebDAV is the only available export target for now.")).not.toBeInTheDocument();
        expect(page.queryByText("Compatible software")).not.toBeInTheDocument();
        expect(page.queryByText("Before you test")).not.toBeInTheDocument();
        expect(page.queryByText("Complete the connection details")).not.toBeInTheDocument();

        expect(page.getByText("Test connection")).toBeDisabled();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Storage URL, username, and password are required.")).toBeInTheDocument();

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });

        expect(page.getByText("Test connection")).toBeEnabled();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Test the WebDAV connection successfully before continuing.")).toBeInTheDocument();
        expectCurrentStep(page, "storage");
    });

    it("requires retesting after editing validated storage credentials", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));
        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        fireEvent.click(page.getByText("Next"));

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));

        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret-2" } });

        expect(page.queryByText("Connection valid")).not.toBeInTheDocument();
        expect(page.queryByText("Ready to test")).not.toBeInTheDocument();
        expect(page.getByText("Test connection")).toBeEnabled();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Test the WebDAV connection successfully before continuing.")).toBeInTheDocument();
        expectCurrentStep(page, "storage");
    });

    it("invokes storage validation use case with current credentials and keeps step blocked on failure", async () => {
        const context = getTestContext();
        const validateConnectionSpy = vi
            .spyOn(context.compositionRoot.storage.validateConnection, "execute")
            .mockReturnValue(Future.error(new Error("WebDAV server rejected the credentials.")));
        const page = getReactComponent(<WizardPage />, context);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));
        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        fireEvent.click(page.getByText("Next"));

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav/files/demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));

        await page.findByText("WebDAV server rejected the credentials. Review the setup remarks above and try again.");
        expect(validateConnectionSpy).toHaveBeenCalledWith({
            url: "https://dav.example.org/remote.php/dav/files/demo",
            username: "demo",
            password: "secret",
        });

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Test the WebDAV connection successfully before continuing.")).toBeInTheDocument();
        expectCurrentStep(page, "storage");
    });

    it("blocks preview progression when duplicate target filepaths exist", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByTestId("wizard-file-select-de-file-b"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/shared.pdf" },
        });
        fireEvent.change(page.getByTestId("wizard-template-input-de-file-b"), {
            target: { value: "/exports/shared.pdf" },
        });
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByText("Duplicate target filepaths detected")).toBeInTheDocument();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(
            page.getByText(
                "Duplicate target filepaths were found. Revise the template to make each export destination unique."
            )
        ).toBeInTheDocument();
        expectCurrentStep(page, "preview");
    });

    it("downloads execution configuration json from preview", async () => {
        const page = getReactComponent(<WizardPage />);
        let downloadedBlob: Blob | undefined;
        const createObjectURLSpy = vi.fn((blob: Blob | MediaSource) => {
            downloadedBlob = blob as Blob;
            return "blob:preview-config";
        });
        const revokeObjectURLSpy = vi.fn(() => undefined);
        const originalCreateObjectURL = URL.createObjectURL;
        const originalRevokeObjectURL = URL.revokeObjectURL;
        Object.defineProperty(URL, "createObjectURL", {
            configurable: true,
            writable: true,
            value: createObjectURLSpy,
        });
        Object.defineProperty(URL, "revokeObjectURL", {
            configurable: true,
            writable: true,
            value: revokeObjectURLSpy,
        });
        const clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => undefined);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));

        try {
            fireEvent.click(await page.findByTestId("wizard-export-config-button"));

            await waitFor(() => {
                expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
            });

            expect(clickSpy).toHaveBeenCalledTimes(1);
            expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:preview-config");
            expect(await page.findByText("Execution configuration downloaded")).toBeInTheDocument();
            expect(
                page.getByText("The JSON execution configuration for this preview was downloaded.")
            ).toBeInTheDocument();

            expect(downloadedBlob).toBeInstanceOf(Blob);
            expect((downloadedBlob as Blob).type).toBe("application/json");
        } finally {
            Object.defineProperty(URL, "createObjectURL", {
                configurable: true,
                writable: true,
                value: originalCreateObjectURL,
            });
            Object.defineProperty(URL, "revokeObjectURL", {
                configurable: true,
                writable: true,
                value: originalRevokeObjectURL,
            });
        }
    });

    it("highlights rows missing FileResource and shows skipped-file warning", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file-b"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByText("Files will be skipped")).toBeInTheDocument();
        expect(page.getByText("1 files without FileResource won't be exported.")).toBeInTheDocument();
        expect(page.getByTestId("wizard-preview-row-evt-2:de-file-b")).toHaveClass(
            "wizard-preview-row-warning"
        );
        expect(page.getByText("Missing FileResource metadata for missing-resource-value")).toBeInTheDocument();
        expect(page.getByTestId("wizard-preview-stats").textContent).toContain("1");
        expect(page.getAllByText("-").length).toBeGreaterThan(0);
    });

    it("inserts selected property token into template at cursor", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        const input = page.getByTestId("wizard-template-input") as HTMLTextAreaElement;
        input.focus();
        input.setSelectionRange(0, 0);
        fireEvent.click(await page.findByTestId("wizard-token-orgUnitName"));

        expect(input.value.startsWith("{orgUnitName}")).toBe(true);
    });

    it("shows resolved template values inside inline template preview", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/{fileName}" },
        });

        expect(await page.findByText("Valid template. Preview:")).toBeInTheDocument();
        expect(await page.findByTestId("wizard-resolved-template-list-de-file")).toBeInTheDocument();
        expect(page.getByText("/visit-form.pdf")).toBeInTheDocument();
        expect(page.queryByTestId("wizard-preview-table")).not.toBeInTheDocument();
    });

    it("limits available data element properties to the selected file stage", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByTestId("wizard-token-orgUnitName")).toBeInTheDocument();
        expect(page.queryByTestId("wizard-token-de-other-stage-text")).not.toBeInTheDocument();
    });

    it("shows file metadata first and places the token hint below the template input", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        const propertyGroups = await page.findByTestId("wizard-property-groups");
        const fileMetadataTitle = within(propertyGroups).getByText("File metadata");
        const organisationUnitTitle = within(propertyGroups).getByText("Organisation unit");
        const input = page.getByTestId("wizard-template-input");
        const hint = page.getByText(
            "Use tokens like {orgUnitName}, {enrollmentDate}, {attribute:NationalID}, {dataElement:FileName}."
        );

        fireEvent.change(input, {
            target: { value: "/{fileName}" },
        });

        const preview = await page.findByText("Valid template. Preview:");

        expect(
            fileMetadataTitle.compareDocumentPosition(organisationUnitTitle)
        ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(input.compareDocumentPosition(hint)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(hint.compareDocumentPosition(preview)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(await page.findByTestId("wizard-token-fileExtension")).toBeInTheDocument();
    });

    it("uses quiet inline feedback for missing template instead of a template error notice", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "" },
        });
        fireEvent.click(page.getByText("Next"));

        expect(page.queryByText("Template error")).not.toBeInTheDocument();
        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Required.")).toBeInTheDocument();
        expect(page.getByTestId("wizard-template-input")).toHaveClass("wizard-input-invalid");
    });

    it("does not repeat the current step title inside template content", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        expectCurrentStep(page, "template");
        expect(
            page.queryByRole("heading", {
                level: 3,
                name: "Template",
            })
        ).not.toBeInTheDocument();
    });

    it("allows clicking available step tabs to navigate after preview is valid", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();

        const storageTab = page.getByTestId("wizard-step-tab-storage");
        expect(storageTab).toBeEnabled();
        fireEvent.click(storageTab);
        expectCurrentStep(page, "storage");
        expect(page.getByTestId("wizard-step-tab-template")).not.toHaveAttribute("aria-current");
        expect(page.getByTestId("wizard-step-complete-program")).toBeInTheDocument();
        expect(page.getByTestId("wizard-step-complete-template")).toBeInTheDocument();
        expect(page.getByTestId("wizard-step-tab-execution")).toBeDisabled();

        fireEvent.click(page.getByTestId("wizard-step-tab-program"));
        expectCurrentStep(page, "program");
    });

    it("blocks next when no file data value is selected", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Select at least one file data value to sync.")).toBeInTheDocument();
        expectCurrentStep(page, "program");
    });

    it("blocks template step progression when any selected file has no mapping", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("A mapping is required for each selected file.")).toBeInTheDocument();
        expectCurrentStep(page, "template");
    });

    it("renders numbered step tabs and a dedicated footer action bar", () => {
        const page = getReactComponent(<WizardPage />);

        expect(page.queryByText("Step 1 of 5: Program")).not.toBeInTheDocument();
        expect(page.getByTestId("wizard-step-number-program").textContent).toContain("1");
        expect(page.getByTestId("wizard-step-number-template").textContent).toContain("2");
        expect(page.getByTestId("wizard-step-tab-preview")).toBeDisabled();
        expect(page.getByTestId("wizard-footer-actions")).toBeInTheDocument();
        expect(page.getByTestId("wizard-footer-actions").textContent).toContain("Back");
        expect(page.getByTestId("wizard-footer-actions").textContent).toContain("Next");
    });

    it("uses a shared step intro on template, preview, storage, and execution steps", async () => {
        mockSourceDownloads();
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        expect(page.getByTestId("wizard-step-intro").textContent).toContain(
            "Define the export scope and filename templates"
        );

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByTestId("wizard-preview-table")).toBeInTheDocument();
        expect(page.getByTestId("wizard-step-intro").textContent).toContain(
            "Review the resolved export plan"
        );

        fireEvent.click(page.getByText("Next"));
        expect(page.getByTestId("wizard-step-intro").textContent).toContain(
            "Validate the WebDAV destination"
        );

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Test connection"));
        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        expect(page.getByTestId("wizard-step-intro").textContent).toContain("Run the export");
        expect(page.getByTestId("wizard-step-intro").textContent).toContain(
            "Transfer the reviewed files to the configured destination."
        );
        const footer = page.getByTestId("wizard-footer-actions");
        expect(within(footer).getByText("Finish")).toBeInTheDocument();
        expect(within(footer).queryByText("Next")).not.toBeInTheDocument();
    });
});
