import { renderHook, waitFor } from "@testing-library/react";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { AppContext } from "$/webapp/contexts/app-context";
import { useOrganisationUnits } from "$/webapp/pages/landing/hooks/useOrganisationUnits";
import { describe, expect, it } from "vitest";

const context = {
    currentUser: User.create({
        id: "user-a",
        name: "Test User",
        username: "test",
        userRoles: [],
        userGroups: [],
    }),
    compositionRoot: getTestCompositionRoot(),
};

describe("useOrganisationUnits", () => {
    it("loads organisation units on mount", async () => {
        const { result } = renderHook(() => useOrganisationUnits(), {
            wrapper: ({ children }) => (
                <AppContext.Provider value={context}>{children}</AppContext.Provider>
            ),
        });

        await waitFor(() => {
            expect(result.current.state.status).toBe("success");
        });

        if (result.current.state.status !== "success") {
            throw new Error("Expected success state");
        }

        expect(result.current.state.data).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ id: "ou-a", name: "Central Clinic" }),
                expect.objectContaining({ id: "ou-b", name: "North District" }),
            ])
        );
    });
});
