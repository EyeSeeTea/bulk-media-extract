import { renderHook, waitFor } from "@testing-library/react";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { AppContext } from "$/webapp/contexts/app-context";
import { useFileCapablePrograms } from "$/webapp/pages/landing/hooks/useFileCapablePrograms";
import { parseDhis2Version } from "$/webapp/utils/dhis2Version";
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
    dhis2Version: parseDhis2Version("2.41.0"),
};

describe("useFileCapablePrograms", () => {
    it("loads file-capable programs on mount", async () => {
        const { result } = renderHook(() => useFileCapablePrograms(), {
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
                expect.objectContaining({ id: "prog-a", name: "Antenatal Visit" }),
                expect.objectContaining({ id: "prog-b", name: "Community Outreach" }),
            ])
        );
    });
});
