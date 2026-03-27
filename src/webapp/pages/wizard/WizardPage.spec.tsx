import { act, fireEvent, waitFor, within } from "@testing-library/react";
import { Future } from "$/domain/entities/generic/Future";
import { getReactComponent, getTestContext } from "$/utils/tests";
import { WizardPage } from "$/webapp/pages/wizard/WizardPage";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@dhis2/ui", async () => {
    const actual = await vi.importActual<typeof import("@dhis2/ui")>("@dhis2/ui");

    return {
        ...actual,
        SingleSelectField: (props: {
            selected?: string;
            onChange?: (payload: { selected: string }) => void;
            children?: React.ReactNode;
        }) => (
            <select
                data-testid="wizard-program-select-mock"
                value={props.selected ?? ""}
                onChange={event => props.onChange?.({ selected: event.target.value })}
            >
                <option value="" />
                {props.children}
            </select>
        ),
        SingleSelectOption: (props: { value: string; label?: string }) => (
            <option value={props.value}>{props.label ?? props.value}</option>
        ),
    };
});

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
    vi.unstubAllGlobals();
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

function createMockDirectoryHandle(name = "Exports") {
    const writes: BlobPart[] = [];
    const writable = {
        write: vi.fn(async (chunk?: BlobPart) => {
            if (chunk !== undefined) {
                writes.push(chunk);
            }
        }),
        close: vi.fn(async () => undefined),
        abort: vi.fn(async () => undefined),
    };
    const fileHandle = {
        kind: "file" as const,
        name: "output.pdf",
        createWritable: vi.fn(async () => writable),
    };
    const nestedDirectoryHandle: FileSystemDirectoryHandle = {
        kind: "directory" as const,
        name,
        getDirectoryHandle: vi.fn(
            async (): Promise<FileSystemDirectoryHandle> => nestedDirectoryHandle
        ),
        getFileHandle: vi.fn(async () => fileHandle),
        queryPermission: vi.fn(async () => "granted" as const),
        requestPermission: vi.fn(async () => "granted" as const),
    } as unknown as FileSystemDirectoryHandle;

    return {
        handle: nestedDirectoryHandle,
        writable,
        writes,
    };
}

function mockLocalDirectorySelection(handle?: FileSystemDirectoryHandle) {
    const directory = handle ?? createMockDirectoryHandle().handle;
    const picker = vi.fn(async () => directory);
    vi.stubGlobal("showDirectoryPicker", picker);
    return { picker, handle: directory };
}

function expectCurrentStep(page: ReturnType<typeof getReactComponent>, stepId: string) {
    expect(page.getByTestId(`wizard-step-tab-${stepId}`)).toHaveAttribute("aria-current", "step");
}

async function renderWizardPage(context = getTestContext()) {
    let view!: ReturnType<typeof getReactComponent>;
    await act(async () => {
        view = getReactComponent(<WizardPage />, context);
    });
    await view.findByTestId("wizard-program-select");
    return view;
}

async function clickAndFlush(element: Element) {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
        fireEvent.click(element);
        await Promise.resolve();
    });
}

async function changeAndFlush(element: Element, value: Record<string, unknown>) {
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
        fireEvent.change(element, { target: value });
        await Promise.resolve();
    });
}

describe("WizardPage", () => {
    it("blocks next when program is not selected", async () => {
        const view = await renderWizardPage();

        await clickAndFlush(view.getByText("Next"));

        expect(view.getByText("Validation required")).toBeInTheDocument();
        expect(view.getByText("Program is required.")).toBeInTheDocument();
        expectCurrentStep(view, "program");
        expect(view.queryByText("Step 1 of 5: Program")).not.toBeInTheDocument();
    });

    it("renders the redesigned program step hierarchy and summary", async () => {
        const view = await renderWizardPage();

        expectCurrentStep(view, "program");
        expect(view.getByText("Choose a program and the files to export")).toBeInTheDocument();
        expect(
            view.getByText(
                "Start by selecting the tracker program. Then confirm which file data values should move forward to template setup and preview."
            )
        ).toBeInTheDocument();
        expect(view.queryByText("Program summary")).not.toBeInTheDocument();

        const programSelect = view.getByTestId("wizard-program-select");
        await changeAndFlush(programSelect, { value: "prog-a" });

        expect(await view.findByText("Program summary")).toBeInTheDocument();
        expect(await view.findByTestId("wizard-program-summary")).toBeInTheDocument();
        expect(view.getByText("Tracker Program")).toBeInTheDocument();
        expect(view.getByText("Selected: 0 of 2")).toBeInTheDocument();

        await clickAndFlush(view.getByTestId("wizard-file-select-de-file"));

        expect(view.getByText("Selected: 1 of 2")).toBeInTheDocument();
        expect(view.getByText("Visit Form")).toBeInTheDocument();
        expect(view.getAllByText("Main Stage").length).toBeGreaterThan(0);
        expect(view.getByTestId("wizard-step-number-program").textContent).toContain("1");
    });

    it("preserves template step filters when navigating back from preview", async () => {
        const view = await renderWizardPage();

        const programSelect = view.getByTestId("wizard-program-select");
        await changeAndFlush(programSelect, { value: "prog-a" });
        await clickAndFlush(await view.findByTestId("wizard-file-select-de-file"));

        await clickAndFlush(view.getByText("Next"));
        expectCurrentStep(view, "template");
        expect(view.getByText("Path and filename template - Visit Form")).toBeInTheDocument();

        await clickAndFlush(view.getByTestId("org-unit-tree-picker"));
        await changeAndFlush(view.getByTestId("wizard-org-unit-mode"), { value: "selected" });
        await changeAndFlush(view.getByTestId("wizard-date-from"), { value: "2026-01-01" });
        await changeAndFlush(view.getByTestId("wizard-date-to"), { value: "2026-01-31" });
        await changeAndFlush(view.getByTestId("wizard-template-input"), {
            value: "/exports/{fileName}",
        });

        await clickAndFlush(view.getByText("Next"));
        expectCurrentStep(view, "preview");

        await clickAndFlush(view.getByText("Back"));
        expectCurrentStep(view, "template");
        expect(view.getByTestId("org-unit-tree-picker")).toBeInTheDocument();
        expect((view.getByTestId("wizard-org-unit-mode") as HTMLSelectElement).value).toBe(
            "selected"
        );
        expect((view.getByTestId("wizard-date-from") as HTMLInputElement).value).toBe("2026-01-01");
        expect((view.getByTestId("wizard-date-to") as HTMLInputElement).value).toBe("2026-01-31");
        expect((view.getByTestId("wizard-template-input") as HTMLTextAreaElement).value).toBe(
            "/exports/{fileName}"
        );
    });

    it("supports preview, storage validation, and successful execution", async () => {
        mockSourceDownloads();
        const view = await renderWizardPage();

        const programSelect = view.getByTestId("wizard-program-select");
        await changeAndFlush(programSelect, { value: "prog-a" });
        await clickAndFlush(await view.findByTestId("wizard-file-select-de-file"));
        await clickAndFlush(view.getByText("Next"));

        await clickAndFlush(view.getByTestId("org-unit-tree-picker"));
        await changeAndFlush(view.getByTestId("wizard-date-from"), { value: "2026-01-01" });
        await changeAndFlush(view.getByTestId("wizard-date-to"), { value: "2026-01-31" });
        await changeAndFlush(view.getByTestId("wizard-template-input"), {
            value: "/exports/{orgUnitName}/{fileName}",
        });
        await clickAndFlush(view.getByText("Next"));

        expect(await view.findByTestId("wizard-preview-table")).toBeInTheDocument();
        expectCurrentStep(view, "preview");
        const summary = view.getByTestId("wizard-preview-summary");
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
        expect(programText.compareDocumentPosition(mappingText)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(mappingText.compareDocumentPosition(orgUnitText)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );
        expect(orgUnitText.compareDocumentPosition(modeText)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );

        const table = view.getByTestId("wizard-preview-table");
        expect(within(table).queryByText("Date")).not.toBeInTheDocument();
        expect(within(table).queryByText("Target filepath")).not.toBeInTheDocument();
        expect(view.getByText("/exports/Central Clinic/visit-form.pdf")).toBeInTheDocument();
        const eventLink = view.getByRole("link", { name: "evt-1" }) as HTMLAnchorElement;
        expect(eventLink).toHaveClass("wizard-preview-event-link");
        expect(eventLink.href).toContain(
            "/dhis2/dhis-web-capture/index.html#/enrollmentEventEdit?eventId=evt-1&orgUnitId=ou-a"
        );
        const originalFileLink = view.getByRole("link", {
            name: "Original file",
        }) as HTMLAnchorElement;
        expect(originalFileLink.href).toContain(
            "/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file"
        );
        const footer = view.getByTestId("wizard-preview-footer");
        expect(table.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
        expect(view.getByText("Files")).toBeInTheDocument();
        expect(view.getAllByText("1.0 KB").length).toBeGreaterThan(0);

        await clickAndFlush(view.getByText("Next"));
        expectCurrentStep(view, "storage");

        await changeAndFlush(view.getByTestId("wizard-storage-url"), {
            value: "https://dav.example.org/remote.php/dav",
        });
        await changeAndFlush(view.getByTestId("wizard-storage-username"), { value: "demo" });
        await changeAndFlush(view.getByTestId("wizard-storage-password"), { value: "secret" });
        await clickAndFlush(view.getByText("Test connection"));

        await view.findByText("WebDAV connection validated. You can continue to execution.");
        await clickAndFlush(view.getByText("Next"));

        expectCurrentStep(view, "execution");
        expect(view.getByText("Finish")).toBeInTheDocument();
        expect(view.getByText("Finish")).toBeEnabled();
        expect(view.queryByTestId("wizard-execution-progress-panel")).not.toBeInTheDocument();
        expect(view.queryByTestId("wizard-execution-log")).not.toBeInTheDocument();
        await clickAndFlush(view.getByText("Start export"));

        await waitFor(() => {
            expect(view.getByText("All files processed successfully.")).toBeInTheDocument();
        });
        expect(view.getByTestId("wizard-execution-stat-pair-throughput").textContent).toContain(
            "Processed"
        );
        expect(view.getByTestId("wizard-execution-stat-pair-throughput").textContent).toContain(
            "Progress"
        );
        expect(view.getByTestId("wizard-execution-stat-pair-outcome").textContent).toContain(
            "Successes"
        );
        expect(view.getByTestId("wizard-execution-stat-pair-outcome").textContent).toContain(
            "Failures"
        );
        expect(view.getByTestId("wizard-execution-stats").textContent).toContain("1/1");
        expect(view.getByTestId("wizard-execution-progress-panel")).toBeInTheDocument();
        expect(view.getByTestId("wizard-execution-progress-bar")).toHaveAttribute(
            "aria-valuenow",
            "100"
        );
        const executionLog = view.getByTestId("wizard-execution-log");
        expect(executionLog).not.toHaveAttribute("open");
        expect(within(executionLog).getByText("3 entries")).toBeInTheDocument();
        await clickAndFlush(view.getByTestId("wizard-execution-log-toggle"));
        expect(executionLog).toHaveAttribute("open");
        expect(view.getByTestId("wizard-execution-log-list")).toBeInTheDocument();
        expect(
            within(executionLog).getByText("Export started with 1 file to process.")
        ).toBeInTheDocument();
        expect(
            within(executionLog).getByText("/exports/Central Clinic/visit-form.pdf")
        ).toBeInTheDocument();
        expect(
            view.queryByText("Latest target path: /exports/Central Clinic/visit-form.pdf")
        ).not.toBeInTheDocument();
        expect(view.getByText("Download result summary")).toBeInTheDocument();
        expect(view.getByText("Finish")).toBeEnabled();
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
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });
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
        expect(
            page.getByText("Upload failed for /exports/fail-consent-form.pdf")
        ).toBeInTheDocument();
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
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });
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
            .spyOn(context.compositionRoot.storage.webdav.uploadFile, "execute")
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
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });
        fireEvent.click(page.getByText("Test connection"));
        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByText("Start export"));
        expect(await page.findByText("Interrupt export")).toBeInTheDocument();
        fireEvent.click(page.getByText("Interrupt export"));

        await waitFor(() => {
            expect(page.getByText("Export interrupted")).toBeInTheDocument();
        });
        expect(
            page.getByText("Execution was interrupted before all transfers completed.")
        ).toBeInTheDocument();
        const executionLog = page.getByTestId("wizard-execution-log");
        expect(executionLog).not.toHaveAttribute("open");
        fireEvent.click(page.getByTestId("wizard-execution-log-toggle"));
        expect(
            within(executionLog).getByText("Export interrupted after 0 of 1 file.")
        ).toBeInTheDocument();
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
        expect(
            page.getByText(
                "Use a WebDAV-compatible storage service such as ownCloud, Nextcloud, or another WebDAV-enabled server."
            )
        ).toBeInTheDocument();
        expect(
            page.getByText(
                "Use the direct WebDAV endpoint, not a generic product homepage or login page."
            )
        ).toBeInTheDocument();
        expect(
            page.getByText(
                "The WebDAV server must allow cross-origin requests from this app origin (CORS) or the browser will block validation and file transfer."
            )
        ).toBeInTheDocument();
        expect(
            page.queryByText("WebDAV is the only available export target for now.")
        ).not.toBeInTheDocument();
        expect(page.queryByText("Compatible software")).not.toBeInTheDocument();
        expect(page.queryByText("Before you test")).not.toBeInTheDocument();
        expect(page.queryByText("Complete the connection details")).not.toBeInTheDocument();

        expect(page.getByText("Test connection")).toBeDisabled();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(
            page.getByText("Storage URL, username, and password are required.")
        ).toBeInTheDocument();

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });

        expect(page.getByText("Test connection")).toBeEnabled();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(
            page.getByText("Test the WebDAV connection successfully before continuing.")
        ).toBeInTheDocument();
        expectCurrentStep(page, "storage");
    });

    it("lets the user switch to local directory and requires directory validation before continuing", async () => {
        const { handle } = mockLocalDirectorySelection();
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

        fireEvent.click(page.getByTestId("wizard-storage-method-local-directory"));
        expect(page.queryByTestId("wizard-storage-url")).not.toBeInTheDocument();
        expect(page.getByText("Choose folder")).toBeInTheDocument();
        expect(
            page.getByText(
                "Local directory export writes files directly into a folder on this computer instead of sending them to a remote server."
            )
        ).toBeInTheDocument();

        fireEvent.click(page.getByText("Next"));
        expect(page.getByText("Select a local directory before continuing.")).toBeInTheDocument();

        fireEvent.click(page.getByText("Choose folder"));
        await page.findByText("Selected folder: Exports");
        expect(handle).toBeDefined();

        fireEvent.click(page.getByText("Next"));
        expect(
            page.getByText("Validate the selected local directory before continuing.")
        ).toBeInTheDocument();

        fireEvent.click(page.getByText("Validate directory"));
        await page.findByText("Local directory validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        expectCurrentStep(page, "execution");
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
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });
        fireEvent.click(page.getByText("Test connection"));

        await page.findByText("WebDAV connection validated. You can continue to execution.");
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret-2" },
        });

        expect(page.queryByText("Connection valid")).not.toBeInTheDocument();
        expect(page.queryByText("Ready to test")).not.toBeInTheDocument();
        expect(page.getByText("Test connection")).toBeEnabled();

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(
            page.getByText("Test the WebDAV connection successfully before continuing.")
        ).toBeInTheDocument();
        expectCurrentStep(page, "storage");
    });

    it("runs execution against a validated local directory destination", async () => {
        mockSourceDownloads();
        const mockDirectory = createMockDirectoryHandle();
        mockLocalDirectorySelection(mockDirectory.handle);
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

        fireEvent.click(page.getByTestId("wizard-storage-method-local-directory"));
        fireEvent.click(page.getByText("Choose folder"));
        await page.findByText("Selected folder: Exports");
        fireEvent.click(page.getByText("Validate directory"));
        await page.findByText("Local directory validated. You can continue to execution.");
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByText("Start export"));
        await waitFor(() => {
            expect(page.getByText("All files processed successfully.")).toBeInTheDocument();
        });

        expect(mockDirectory.writable.write).toHaveBeenCalled();
        expect(mockDirectory.writable.close).toHaveBeenCalled();
        expect(page.getByText("Download result summary")).toBeInTheDocument();
    });

    it("invokes storage validation use case with current credentials and keeps step blocked on failure", async () => {
        const context = getTestContext();
        const validateConnectionSpy = vi
            .spyOn(context.compositionRoot.storage.webdav.validateConnection, "execute")
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
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });
        fireEvent.click(page.getByText("Test connection"));

        await page.findByText(
            "WebDAV server rejected the credentials. Review the setup remarks above and try again."
        );
        expect(validateConnectionSpy).toHaveBeenCalledWith({
            url: "https://dav.example.org/remote.php/dav/files/demo",
            username: "demo",
            password: "secret",
        });

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(
            page.getByText("Test the WebDAV connection successfully before continuing.")
        ).toBeInTheDocument();
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
        expect(
            page.getByText("1 files without FileResource won't be exported.")
        ).toBeInTheDocument();
        expect(page.getByTestId("wizard-preview-row-evt-2:de-file-b")).toHaveClass(
            "wizard-preview-row-warning"
        );
        const warningRow = page.getByTestId("wizard-preview-row-evt-2:de-file-b");
        expect(
            page.getByText("Missing FileResource metadata for missing-resource-value")
        ).toBeInTheDocument();
        expect(page.getByTestId("wizard-preview-stats").textContent).toContain("1");
        expect(page.getAllByText("-").length).toBeGreaterThan(0);
        expect(
            within(warningRow).queryByRole("link", { name: "Original file" })
        ).not.toBeInTheDocument();
    });

    it("inserts selected property token into template at cursor", async () => {
        const view = await renderWizardPage();

        const programSelect = view.getByTestId("wizard-program-select");
        await changeAndFlush(programSelect, { value: "prog-a" });
        await clickAndFlush(await view.findByTestId("wizard-file-select-de-file"));
        await clickAndFlush(view.getByText("Next"));

        const input = view.getByTestId("wizard-template-input") as HTMLTextAreaElement;
        input.focus();
        input.setSelectionRange(0, 0);
        await clickAndFlush(await view.findByTestId("wizard-token-orgUnitName"));

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
        expect(
            await page.findByTestId("wizard-resolved-template-list-de-file")
        ).toBeInTheDocument();
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

        expect(fileMetadataTitle.compareDocumentPosition(organisationUnitTitle)).toBe(
            Node.DOCUMENT_POSITION_FOLLOWING
        );
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
        const view = await renderWizardPage();

        const programSelect = view.getByTestId("wizard-program-select");
        await changeAndFlush(programSelect, { value: "prog-a" });
        await clickAndFlush(view.getByText("Next"));

        expect(view.getByText("Validation required")).toBeInTheDocument();
        expect(view.getByText("Select at least one file data value to sync.")).toBeInTheDocument();
        expectCurrentStep(view, "program");
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

    it("renders numbered step tabs and a dedicated footer action bar", async () => {
        const view = await renderWizardPage();

        expect(view.queryByText("Step 1 of 5: Program")).not.toBeInTheDocument();
        expect(view.getByTestId("wizard-step-number-program").textContent).toContain("1");
        expect(view.getByTestId("wizard-step-number-template").textContent).toContain("2");
        expect(view.getByTestId("wizard-step-tab-preview")).toBeDisabled();
        expect(view.getByTestId("wizard-footer-actions")).toBeInTheDocument();
        expect(view.getByTestId("wizard-footer-actions").textContent).not.toContain("Back");
        expect(view.getByTestId("wizard-footer-actions").textContent).toContain("Next");
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
            "Choose the export destination"
        );

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), {
            target: { value: "demo" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-password"), {
            target: { value: "secret" },
        });
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
