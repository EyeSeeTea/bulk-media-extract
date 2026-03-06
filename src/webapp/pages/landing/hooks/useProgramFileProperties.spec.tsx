import { renderHook, waitFor } from "@testing-library/react";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { AppContext } from "$/webapp/contexts/app-context";
import { useProgramFileProperties } from "$/webapp/pages/landing/hooks/useProgramFileProperties";
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

describe("useProgramFileProperties", () => {
    it("returns idle when no program is selected", async () => {
        const { result } = renderHook(() => useProgramFileProperties(""), {
            wrapper: ({ children }) => (
                <AppContext.Provider value={context}>{children}</AppContext.Provider>
            ),
        });

        await waitFor(() => {
            expect(result.current.state.status).toBe("idle");
        });
    });

    it("loads file properties for selected program", async () => {
        const { result } = renderHook(() => useProgramFileProperties("prog-a"), {
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

        expect(result.current.state.data.program.id).toBe("prog-a");
        expect(result.current.state.data.properties.length).toBeGreaterThan(0);
    });
});
