import { fireEvent, render } from "@testing-library/react";
import {
    FileCapableProgram,
    ProgramFileProperties,
    ProgramFileProperty,
} from "$/domain/entities/FileExportProgram";
import { describe, expect, it, vi } from "vitest";
import { ProgramStep } from "$/webapp/pages/wizard/steps/ProgramStep";

describe("ProgramStep", () => {
    it("renders program summary and selection-first file cards", () => {
        const onSelectProgram = vi.fn();
        const onSelectFileDataValueIds = vi.fn();
        const programs = [
            {
                id: "prog-a",
                name: "Antenatal Visit",
                organisationUnits: [{ id: "ou-a", name: "Central Clinic" }],
            },
        ];
        const programDetails = ProgramFileProperties.create({
            program: FileCapableProgram.create({
                id: "prog-a",
                name: "Antenatal Visit",
                programType: "WITH_REGISTRATION",
                organisationUnits: [],
            }),
            properties: [
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "Visit Form",
                    sourceType: "dataElement",
                    valueType: "FILE_RESOURCE",
                    sourceContainerName: "Main Stage",
                }),
            ],
            propertyGroups: [],
        });

        const view = render(
            <ProgramStep
                programsState={{ status: "success", data: programs }}
                selectedProgramId="prog-a"
                programDetailsState={{ status: "success", data: programDetails }}
                selectedFileDataValueIds={[]}
                onSelectProgram={onSelectProgram}
                onSelectFileDataValueIds={onSelectFileDataValueIds}
            />
        );

        expect(view.getByText("Program summary")).toBeInTheDocument();
        expect(view.getByTestId("wizard-program-summary")).toBeInTheDocument();
        expect(view.getByText("Tracker Program")).toBeInTheDocument();
        expect(view.getByText("Selected: 0 of 1")).toBeInTheDocument();
        expect(view.getByTestId("wizard-file-select-de-file")).toHaveAttribute("role", "checkbox");

        fireEvent.change(view.getByTestId("wizard-program-select"), {
            target: { value: "prog-a" },
        });
        fireEvent.click(view.getByTestId("wizard-file-select-de-file"));

        expect(onSelectProgram).toHaveBeenCalledWith("prog-a");
        expect(onSelectFileDataValueIds).toHaveBeenCalledWith(["de-file"]);
    });
});
