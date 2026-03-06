import { fireEvent } from "@testing-library/react";
import { getReactComponent } from "$/utils/tests";
import { LandingPage } from "$/webapp/pages/landing/LandingPage";
import { describe, expect, it } from "vitest";

describe("LandingPage", () => {
    it("renders file-capable program flow and gates preview by org unit", async () => {
        const page = getReactComponent(<LandingPage />);

        expect(page.getByLabelText("program-picker")).toBeInTheDocument();
        expect(page.getByLabelText("program-details")).toBeInTheDocument();
        expect(page.getByLabelText("org-unit-preview")).toBeInTheDocument();

        const programSelect = await page.findByTestId("program-select");
        expect(programSelect).toBeInTheDocument();

        const orgUnitSelect = await page.findByTestId("org-unit-select");
        expect(orgUnitSelect).toHaveAttribute("disabled");

        fireEvent.change(programSelect, { target: { value: "prog-a" } });

        expect(await page.findByText(/Program type/)).toBeInTheDocument();
        expect(await page.findByText("WITH_REGISTRATION")).toBeInTheDocument();

        const orgUnitSelectEnabled = await page.findByTestId("org-unit-select");
        expect(orgUnitSelectEnabled).not.toHaveAttribute("disabled");

        fireEvent.change(orgUnitSelectEnabled, { target: { value: "ou-a" } });

        expect(await page.findByText("evt-1")).toBeInTheDocument();
        expect(await page.findByText(/de-file: file-123/)).toBeInTheDocument();
    });
});
