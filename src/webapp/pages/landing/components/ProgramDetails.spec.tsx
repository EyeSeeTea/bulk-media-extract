import { render } from "@testing-library/react";
import { FileCapableProgram } from "$/domain/entities/FileCapableProgram";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
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
            propertyGroups: [],
        });

        const view = render(
            <ProgramDetails
                selectedProgramId="prog-a"
                programDetailsState={{ status: "success", data: details }}
            />
        );

        expect(view.getByText("Tracker Program")).toBeInTheDocument();
        expect(view.getByText(/Upload/)).toBeInTheDocument();
    });

    it("renders event program label for without-registration programs", () => {
        const details = ProgramFileProperties.create({
            program: FileCapableProgram.create({
                id: "prog-b",
                name: "Program B",
                programType: "WITHOUT_REGISTRATION",
                organisationUnits: [],
            }),
            properties: [],
            propertyGroups: [],
        });

        const view = render(
            <ProgramDetails
                selectedProgramId="prog-b"
                programDetailsState={{ status: "success", data: details }}
            />
        );

        expect(view.getByText("Event Program")).toBeInTheDocument();
    });
});
