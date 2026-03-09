import { fireEvent, waitFor, within } from "@testing-library/react";
import { getReactComponent } from "$/utils/tests";
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

describe("WizardPage", () => {
    it("blocks next when program is not selected", () => {
        const page = getReactComponent(<WizardPage />);

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Program is required.")).toBeInTheDocument();
        expect(page.getByText("Step 1 of 5: Program")).toBeInTheDocument();
    });

    it("preserves template step filters when navigating back from preview", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));

        fireEvent.click(page.getByText("Next"));
        expect(page.getByText("Step 2 of 5: Template")).toBeInTheDocument();
        expect(page.getByText("Path and filename template - Visit Form")).toBeInTheDocument();

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-org-unit-mode"), { target: { value: "selected" } });
        fireEvent.change(page.getByTestId("wizard-date-from"), { target: { value: "2026-01-01" } });
        fireEvent.change(page.getByTestId("wizard-date-to"), { target: { value: "2026-01-31" } });
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/exports/{fileName}" },
        });

        fireEvent.click(page.getByText("Next"));
        expect(page.getByText("Step 3 of 5: Preview")).toBeInTheDocument();

        fireEvent.click(page.getByText("Back"));
        expect(page.getByText("Step 2 of 5: Template")).toBeInTheDocument();
        expect(page.getByTestId("org-unit-tree-picker")).toBeInTheDocument();
        expect((page.getByTestId("wizard-org-unit-mode") as HTMLSelectElement).value).toBe("selected");
        expect((page.getByTestId("wizard-date-from") as HTMLInputElement).value).toBe("2026-01-01");
        expect((page.getByTestId("wizard-date-to") as HTMLInputElement).value).toBe("2026-01-31");
        expect((page.getByTestId("wizard-template-input") as HTMLTextAreaElement).value).toBe(
            "/exports/{fileName}"
        );
    });

    it("supports preview, storage validation, and successful execution", async () => {
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
        expect(page.getByText("Step 4 of 5: Storage")).toBeInTheDocument();

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Validate connection"));

        await page.findByText("Storage connection validated.");
        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Step 5 of 5: Execution")).toBeInTheDocument();
        fireEvent.click(page.getByText("Start export"));

        await waitFor(() => {
            expect(page.getByText("All files processed successfully.")).toBeInTheDocument();
        });
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
        expect(page.getByText("Step 3 of 5: Preview")).toBeInTheDocument();
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

    it("shows resolved template values inside template ready notice", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/{fileName}" },
        });

        expect(await page.findByText("Template ready")).toBeInTheDocument();
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
        expect(page.getByText("Step 4 of 5: Storage")).toBeInTheDocument();

        fireEvent.click(page.getByTestId("wizard-step-tab-program"));
        expect(page.getByText("Step 1 of 5: Program")).toBeInTheDocument();
    });

    it("blocks next when no file data value is selected", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Select at least one file data value to sync.")).toBeInTheDocument();
        expect(page.getByText("Step 1 of 5: Program")).toBeInTheDocument();
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
        expect(page.getByText("Step 2 of 5: Template")).toBeInTheDocument();
    });
});
