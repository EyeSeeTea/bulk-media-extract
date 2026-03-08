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

        fireEvent.click(page.getByText("Next"));
        expect(page.getByText("Step 2 of 5: Template")).toBeInTheDocument();

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-org-unit-mode"), { target: { value: "selected" } });
        fireEvent.change(page.getByTestId("wizard-date-from"), { target: { value: "2026-01-01" } });
        fireEvent.change(page.getByTestId("wizard-date-to"), { target: { value: "2026-01-31" } });

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
        fireEvent.click(page.getByText("Next"));

        fireEvent.click(page.getByTestId("org-unit-tree-picker"));
        fireEvent.change(page.getByTestId("wizard-date-from"), { target: { value: "2026-01-01" } });
        fireEvent.change(page.getByTestId("wizard-date-to"), { target: { value: "2026-01-31" } });
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

    it("allows clicking available step tabs to navigate", async () => {
        const page = getReactComponent(<WizardPage />);

        const programSelect = await page.findByTestId("wizard-program-select");
        fireEvent.change(programSelect, { target: { value: "prog-a" } });
        fireEvent.click(page.getByText("Next"));

        const storageTab = page.getByTestId("wizard-step-tab-storage");
        expect(storageTab).toBeEnabled();
        fireEvent.click(storageTab);
        expect(page.getByText("Step 3 of 5: Storage")).toBeInTheDocument();

        fireEvent.click(page.getByTestId("wizard-step-tab-program"));
        expect(page.getByText("Step 1 of 5: Program")).toBeInTheDocument();
    });
});
