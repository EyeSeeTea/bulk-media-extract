import { fireEvent, render } from "@testing-library/react";
import { ProgramEventPreview } from "$/domain/entities/FileExportProgram";
import { describe, expect, it, vi } from "vitest";
import { EventPreview } from "$/webapp/pages/landing/components/EventPreview";

describe("EventPreview", () => {
    it("disables org unit selection when no program is selected", () => {
        const view = render(
            <EventPreview
                orgUnitsState={{ status: "success", data: [{ id: "ou-a", name: "Org Unit A" }] }}
                selectedProgramId=""
                selectedOrgUnitId=""
                onSelectOrgUnit={vi.fn()}
                previewState={{ status: "idle" }}
                onRetryPreview={vi.fn()}
            />
        );

        expect(view.getByTestId("org-unit-select")).toHaveAttribute("disabled");
    });

    it("renders event rows and retries on error", () => {
        const onRetryPreview = vi.fn();

        const view = render(
            <EventPreview
                orgUnitsState={{ status: "success", data: [{ id: "ou-a", name: "Org Unit A" }] }}
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
                orgUnitsState={{ status: "success", data: [{ id: "ou-a", name: "Org Unit A" }] }}
                selectedProgramId="prog-a"
                selectedOrgUnitId="ou-a"
                onSelectOrgUnit={vi.fn()}
                previewState={{
                    status: "success",
                    data: [
                        ProgramEventPreview.create({
                            id: "evt-1",
                            eventDate: "2024-01-01",
                            orgUnitId: "ou-a",
                            orgUnitName: "Org Unit A",
                            fileValues: { "de-file": "file-123" },
                        }),
                    ],
                }}
                onRetryPreview={vi.fn()}
            />
        );

        expect(utils.getByText("evt-1")).toBeInTheDocument();
        expect(utils.getByText(/de-file: file-123/)).toBeInTheDocument();
    });
});
