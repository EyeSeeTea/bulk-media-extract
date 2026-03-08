import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OrgUnitTreePicker } from "$/webapp/components/org-unit-tree-picker/OrgUnitTreePicker";

const treePropsSpy = vi.fn();

vi.mock("@dhis2/ui", () => ({
    OrganisationUnitTree: (props: {
        roots: string[];
        filter: string[];
        disableSelection: boolean;
        onChange: (payload: { id: string; selected: string[] }) => void;
    }) => {
        treePropsSpy(props);

        return (
            <button
                type="button"
                data-testid="mock-org-unit-tree"
                disabled={props.disableSelection}
                onClick={() => props.onChange({ id: "ou-a", selected: ["/root/ou-a"] })}
            >
                {props.roots.join(",")}
            </button>
        );
    },
}));

describe("OrgUnitTreePicker", () => {
    beforeEach(() => {
        treePropsSpy.mockClear();
    });

    it("derives roots and filter from program org unit paths", () => {
        render(
            <OrgUnitTreePicker
                programOrgUnits={[
                    { id: "ou-a", name: "Org Unit A", path: "/root/ou-a" },
                    { id: "ou-b", name: "Org Unit B", path: "/root/ou-b" },
                ]}
                selected=""
                onChange={vi.fn()}
            />
        );

        const lastCall = treePropsSpy.mock.calls[treePropsSpy.mock.calls.length - 1]?.[0];
        expect(lastCall.roots).toEqual(["root"]);
        expect(lastCall.filter).toEqual(["/root/ou-a", "/root/ou-b"]);
    });

    it("uses unique level-1 path segments as roots", () => {
        render(
            <OrgUnitTreePicker
                programOrgUnits={[
                    { id: "ou-1", name: "OU 1", path: "/A/B/C" },
                    { id: "ou-2", name: "OU 2", path: "/A/D" },
                    { id: "ou-3", name: "OU 3", path: "/X/Y" },
                ]}
                selected=""
                onChange={vi.fn()}
            />
        );

        const lastCall = treePropsSpy.mock.calls[treePropsSpy.mock.calls.length - 1]?.[0];
        expect(lastCall.roots).toEqual(["A", "X"]);
        expect(lastCall.filter).toEqual(["/A/B/C", "/A/D", "/X/Y"]);
    });

    it("emits selected org unit id", () => {
        const onChange = vi.fn();

        const view = render(
            <OrgUnitTreePicker
                programOrgUnits={[{ id: "ou-a", name: "Org Unit A", path: "/root/ou-a" }]}
                selected=""
                onChange={onChange}
            />
        );

        fireEvent.click(view.getByTestId("mock-org-unit-tree"));

        expect(onChange).toHaveBeenCalledWith("ou-a");
    });

    it("disables selection when disabled", () => {
        const view = render(
            <OrgUnitTreePicker
                programOrgUnits={[{ id: "ou-a", name: "Org Unit A", path: "/root/ou-a" }]}
                selected=""
                onChange={vi.fn()}
                disabled
            />
        );

        expect(view.getByTestId("mock-org-unit-tree")).toBeDisabled();
    });
});
