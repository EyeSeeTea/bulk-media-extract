import { fireEvent } from "@testing-library/react";
import { getReactComponent } from "$/utils/tests";
import { LandingPage } from "$/webapp/pages/landing/LandingPage";
import { describe, expect, it, vi } from "vitest";

vi.mock("$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker", () => ({
    OrgUnitTreePicker: (props: {
        programOrgUnits: Array<{ id: string; name: string; path?: string }>;
        disabled?: boolean;
        onChange: (selection: { id: string; name?: string }) => void;
    }) => (
        <button
            type="button"
            data-testid="org-unit-tree-picker"
            disabled={Boolean(props.disabled)}
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

describe("LandingPage", () => {
    it("renders file-capable program flow and gates preview by org unit", async () => {
        const page = getReactComponent(<LandingPage />);

        expect(page.getByLabelText("program-picker")).toBeInTheDocument();
        expect(page.getByLabelText("program-details")).toBeInTheDocument();
        expect(page.getByLabelText("org-unit-preview")).toBeInTheDocument();

        const programSelect = await page.findByTestId("program-select");
        expect(programSelect).toBeInTheDocument();

        expect(page.queryByTestId("org-unit-tree-picker")).not.toBeInTheDocument();

        fireEvent.change(programSelect, { target: { value: "prog-a" } });

        expect(await page.findByText(/Program type/)).toBeInTheDocument();
        expect(await page.findByText("WITH_REGISTRATION")).toBeInTheDocument();

        const orgUnitTreeEnabled = await page.findByTestId("org-unit-tree-picker");
        expect(orgUnitTreeEnabled).toBeInTheDocument();

        fireEvent.click(orgUnitTreeEnabled);

        expect(await page.findByText("evt-1")).toBeInTheDocument();
        expect(await page.findByText(/de-file: file-123/)).toBeInTheDocument();
    });
});
