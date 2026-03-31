import { fireEvent } from "@testing-library/react";
import { getReactComponent } from "$/utils/tests";
import { LandingPage } from "$/webapp/pages/landing/LandingPage";
import { describe, expect, it, vi } from "vitest";

const mockPush = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
    return {
        ...actual,
        useHistory: () => ({ push: mockPush }),
    };
});

describe("LandingPage", () => {
    it("renders a start new export button that navigates to the wizard", () => {
        const page = getReactComponent(<LandingPage />);

        const button = page.getByText("Start new export");
        expect(button).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockPush).toHaveBeenCalledWith("/wizard");
    });
});
