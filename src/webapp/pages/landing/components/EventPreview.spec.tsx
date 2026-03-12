import { fireEvent, render } from "@testing-library/react";
import { ProgramEventPreview } from "$/domain/entities/ProgramEventPreview";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { describe, expect, it, vi } from "vitest";
import { EventPreview } from "$/webapp/pages/landing/components/EventPreview";

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

describe("EventPreview", () => {
    it("does not render org unit tree when no program is selected", () => {
        const view = render(
            <EventPreview
                programOrgUnits={[{ id: "ou-a", name: "Org Unit A", path: "/root/ou-a" }]}
                selectedProgramId=""
                selectedOrgUnitId=""
                onSelectOrgUnit={vi.fn()}
                previewState={{ status: "idle" }}
                onRetryPreview={vi.fn()}
            />
        );

        expect(view.queryByTestId("org-unit-tree-picker")).not.toBeInTheDocument();
        expect(view.getByText("Select a program to load organisation units.")).toBeInTheDocument();
    });

    it("selects org unit via tree picker", () => {
        const onSelectOrgUnit = vi.fn();

        const view = render(
            <EventPreview
                programOrgUnits={[{ id: "ou-a", name: "Org Unit A", path: "/root/ou-a" }]}
                selectedProgramId="prog-a"
                selectedOrgUnitId=""
                onSelectOrgUnit={onSelectOrgUnit}
                previewState={{ status: "idle" }}
                onRetryPreview={vi.fn()}
            />
        );

        fireEvent.click(view.getByTestId("org-unit-tree-picker"));
        expect(onSelectOrgUnit).toHaveBeenCalledWith({ id: "ou-a", name: "Org Unit A" });
    });

    it("renders event rows and retries on error", () => {
        const onRetryPreview = vi.fn();

        const view = render(
            <EventPreview
                programOrgUnits={[{ id: "ou-a", name: "Org Unit A", path: "/root/ou-a" }]}
                selectedProgramId="prog-a"
                selectedOrgUnitId="ou-a"
                onSelectOrgUnit={vi.fn()}
                previewState={{ status: "error", error: "boom" }}
                onRetryPreview={onRetryPreview}
            />
        );

        fireEvent.click(view.getByText("Retry preview"));
        expect(onRetryPreview).toHaveBeenCalled();

        view.unmount();

        const utils = render(
            <EventPreview
                programOrgUnits={[{ id: "ou-a", name: "Org Unit A", path: "/root/ou-a" }]}
                selectedProgramId="prog-a"
                selectedOrgUnitId="ou-a"
                onSelectOrgUnit={vi.fn()}
                previewState={{
                    status: "success",
                    data: ProgramEventsPreviewResult.create({
                        events: [
                            ProgramEventPreview.create({
                                id: "evt-1",
                                eventDate: "2024-01-01",
                                orgUnitId: "ou-a",
                                orgUnitName: "Org Unit A",
                                orgUnitAttributeValues: {},
                                dataValues: { "de-file": "file-123" },
                                attributeValues: {},
                                fileValues: { "de-file": "file-123" },
                                fileNames: { "de-file": "file-123.pdf" },
                            }),
                        ],
                        total: 1,
                        pageCount: 1,
                    }),
                }}
                onRetryPreview={vi.fn()}
            />
        );

        expect(utils.getByText("evt-1")).toBeInTheDocument();
        expect(utils.getByText(/de-file: file-123/)).toBeInTheDocument();
        expect(utils.getByText("Matching events: 1. Pages: 1.")).toBeInTheDocument();
    });
});
