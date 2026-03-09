import { fireEvent, waitFor } from "@testing-library/react";
import { getReactComponent } from "$/utils/tests";
import { WizardPage } from "$/webapp/pages/wizard/WizardPage";
import { describe, expect, it, vi } from "vitest";

vi.mock("$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker", () => ({
    OrgUnitTreePicker: (props: {
        programOrgUnits: Array<{ id: string; name: string; path?: string }>;
        onChange: (id: string) => void;
    }) => (
        <button
            type="button"
            data-testid="org-unit-tree-picker"
            onClick={() => props.onChange(props.programOrgUnits[0]?.id ?? "")}
        >
            Mock org unit tree
        </button>
    ),
}));

describe("WizardPage", () => {
    it("blocks next when program is not selected", () => {
        const page = getReactComponent(<WizardPage />);

        fireEvent.click(page.getByText("Next"));

        expect(page.getByText("Validation required")).toBeInTheDocument();
        expect(page.getByText("Program is required.")).toBeInTheDocument();
        expect(page.getByText("Step 1 of 5: Program")).toBeInTheDocument();
    });

    it("preserves template step filters when navigating back", async () => {
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
            target: { value: "/{dataElement:de-file}.pdf" },
        });

        fireEvent.click(page.getByText("Next"));
        expect(page.getByText("Step 3 of 5: Storage")).toBeInTheDocument();

        fireEvent.click(page.getByText("Back"));
        expect(page.getByText("Step 2 of 5: Template")).toBeInTheDocument();
        expect(page.getByTestId("org-unit-tree-picker")).toBeInTheDocument();
        expect((page.getByTestId("wizard-org-unit-mode") as HTMLSelectElement).value).toBe("selected");
        expect((page.getByTestId("wizard-date-from") as HTMLInputElement).value).toBe("2026-01-01");
        expect((page.getByTestId("wizard-date-to") as HTMLInputElement).value).toBe("2026-01-31");
    });

    it("supports preview and successful execution", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-date-from"), { target: { value: "2026-01-01" } });
        fireEvent.change(page.getByTestId("wizard-date-to"), { target: { value: "2026-01-31" } });
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/{dataElement:de-file}.pdf" },
        });
        fireEvent.click(page.getByText("Next"));

        fireEvent.change(page.getByTestId("wizard-storage-url"), {
            target: { value: "https://dav.example.org/remote.php/dav" },
        });
        fireEvent.change(page.getByTestId("wizard-storage-username"), { target: { value: "demo" } });
        fireEvent.change(page.getByTestId("wizard-storage-password"), { target: { value: "secret" } });
        fireEvent.click(page.getByText("Validate connection"));

        await page.findByText("Storage connection validated.");
        fireEvent.click(page.getByText("Next"));

        expect(await page.findByText("evt-1")).toBeInTheDocument();

        fireEvent.click(page.getByText("Next"));
        fireEvent.click(page.getByText("Start export"));

        await waitFor(() => {
            expect(page.getByText("All files processed successfully.")).toBeInTheDocument();
        });
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
        expect(page.queryByTestId("wizard-quick-preview-table")).not.toBeInTheDocument();
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

    it("allows clicking available step tabs to navigate", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(await page.findByTestId("wizard-file-select-de-file"));
        fireEvent.click(page.getByText("Next"));
        fireEvent.change(page.getByTestId("wizard-template-input"), {
            target: { value: "/{dataElement:de-file}.pdf" },
        });

        const storageTab = page.getByTestId("wizard-step-tab-storage");
        expect(storageTab).toBeEnabled();
        fireEvent.click(storageTab);
        expect(page.getByText("Step 3 of 5: Storage")).toBeInTheDocument();

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
