import { renderHook, waitFor } from "@testing-library/react";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { AppContext } from "$/webapp/contexts/app-context";
import { useProgramEventsPreview } from "$/webapp/pages/landing/hooks/useProgramEventsPreview";
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
    baseUrl: "http://localhost:8081/dhis2",
};

describe("useProgramEventsPreview", () => {
    it("returns idle when program or org unit is missing", async () => {
        const { result } = renderHook(() => useProgramEventsPreview("prog-a", "", "selected"), {
            wrapper: ({ children }) => (
                <AppContext.Provider value={context}>{children}</AppContext.Provider>
            ),
        });

        await waitFor(() => {
            expect(result.current.state.status).toBe("idle");
        });
    });

    it("loads event preview for selected program and org unit", async () => {
        const { result } = renderHook(() => useProgramEventsPreview("prog-a", "ou-a", "descendants"), {
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

        expect(result.current.state.data.events).toEqual(
            expect.arrayContaining([expect.objectContaining({ id: "evt-1" })])
        );
        expect(result.current.state.data.total).toBe(2);
    });
});
