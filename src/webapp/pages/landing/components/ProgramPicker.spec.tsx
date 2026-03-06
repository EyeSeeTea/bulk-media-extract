import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProgramPicker } from "$/webapp/pages/landing/components/ProgramPicker";

describe("ProgramPicker", () => {
    it("shows loading state", () => {
        const view = render(
            <ProgramPicker
                programsState={{ status: "loading" }}
                selectedProgramId=""
                onSelectProgram={vi.fn()}
                onReloadPrograms={vi.fn()}
            />
        );

        expect(view.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders select options and triggers handlers", () => {
        const onSelectProgram = vi.fn();
        const onReloadPrograms = vi.fn();

        const view = render(
            <ProgramPicker
                programsState={{
                    status: "success",
                    data: [{ id: "prog-a", name: "Program A" }],
                }}
                selectedProgramId=""
                onSelectProgram={onSelectProgram}
                onReloadPrograms={onReloadPrograms}
            />
        );

        fireEvent.change(view.getByTestId("program-select"), { target: { value: "prog-a" } });
        fireEvent.click(view.getByText("Reload programs"));

        expect(onSelectProgram).toHaveBeenCalledWith("prog-a");
        expect(onReloadPrograms).toHaveBeenCalled();
    });
});
