import { render } from "@testing-library/react";
import {
    FileCapableProgram,
    ProgramFileProperties,
    ProgramFileProperty,
} from "$/domain/entities/FileExportProgram";
import { describe, expect, it } from "vitest";
import { ProgramDetails } from "$/webapp/pages/landing/components/ProgramDetails";

describe("ProgramDetails", () => {
    it("shows no program selected notice", () => {
        const view = render(
            <ProgramDetails selectedProgramId="" programDetailsState={{ status: "idle" }} />
        );

        expect(view.getByText("No program selected")).toBeInTheDocument();
    });

    it("renders details in success state", () => {
        const details = ProgramFileProperties.create({
            program: FileCapableProgram.create({
                id: "prog-a",
                name: "Program A",
                programType: "WITH_REGISTRATION",
                organisationUnits: [],
            }),
            properties: [
                ProgramFileProperty.create({
                    id: "de-file",
                    name: "Upload",
                    sourceType: "dataElement",
                    valueType: "FILE_RESOURCE",
                }),
            ],
        });

        const view = render(
            <ProgramDetails
                selectedProgramId="prog-a"
                programDetailsState={{ status: "success", data: details }}
            />
        );

        expect(view.getByText("WITH_REGISTRATION")).toBeInTheDocument();
        expect(view.getByText(/Upload/)).toBeInTheDocument();
    });
});
