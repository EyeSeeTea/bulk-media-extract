import { renderHook, waitFor } from "@testing-library/react";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { User } from "$/domain/entities/User";
import { AppContext } from "$/webapp/contexts/app-context";
import { useWizardProgramData } from "$/webapp/pages/wizard/hooks/useWizardProgramData";
import { parseDhis2Version } from "$/webapp/utils/dhis2Version";
import { describe, expect, it, vi } from "vitest";

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

describe("useWizardProgramData", () => {
    it("derives selected program data and normalizes stale file selections", async () => {
        const onNormalizeSelectedFileDataValueIds = vi.fn();
        const { result } = renderHook(
            () =>
                useWizardProgramData({
                    selectedProgramId: "prog-a",
                    selectedFileDataValueIds: ["de-file", "missing-file"],
                    onNormalizeSelectedFileDataValueIds,
                }),
            {
                wrapper: ({ children }) => (
                    <AppContext.Provider value={context}>{children}</AppContext.Provider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current.programDetailsState.status).toBe("success");
        });

        if (result.current.programDetailsState.status !== "success") {
            throw new Error("Expected success state");
        }

        expect(result.current.selectedProgram?.id).toBe("prog-a");
        expect(result.current.selectedFileDataElements.map(file => file.id)).toEqual(["de-file"]);
        expect(onNormalizeSelectedFileDataValueIds).toHaveBeenCalledWith(["de-file"]);
    });
});
