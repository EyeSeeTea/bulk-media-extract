import { renderHook, waitFor } from "@testing-library/react";
import { getTestCompositionRoot } from "$/CompositionRoot";
import { AppContext } from "$/webapp/contexts/app-context";
import { useWizardTemplatePreviewData } from "$/webapp/pages/wizard/hooks/useWizardTemplatePreviewData";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { parseDhis2Version } from "$/webapp/utils/dhis2Version";
import { describe, expect, it } from "vitest";

const context = {
    compositionRoot: getTestCompositionRoot(),
    baseUrl: "http://localhost:8081/dhis2",
    dhis2Version: parseDhis2Version("2.41.0"),
    currentUser: undefined,
};

describe("useWizardTemplatePreviewData", () => {
    it("returns resolved preview entries for each selected file data element when multiple are selected", async () => {
        const selectedFileDataElements: ProgramFileProperty[] = [
            new ProgramFileProperty({
                id: "de-file",
                name: "Visit Form",
                valueType: "FILE_RESOURCE",
                sourceType: "dataElement",
                sourceContainerId: "stage-1",
                sourceContainerName: "Main Stage",
            }),
            new ProgramFileProperty({
                id: "de-file-b",
                name: "Consent Form",
                valueType: "FILE_RESOURCE",
                sourceType: "dataElement",
                sourceContainerId: "stage-1",
                sourceContainerName: "Main Stage",
            }),
        ];

        const selectedFileDataValueIds = ["de-file", "de-file-b"];
        const selectedFilePropertyById = Object.fromEntries(
            selectedFileDataElements.map(p => [p.id, p])
        );
        const mappingByFileKey: Record<string, string> = {
            "de-file": "{fileName}",
            "de-file-b": "{fileName}",
        };

        const { result } = renderHook(
            () =>
                useWizardTemplatePreviewData({
                    currentStepId: "template",
                    selectedProgramId: "prog-a",
                    selectedOrgUnitId: "ou-a",
                    orgUnitSelectionMode: "selected",
                    selectedFileDataValueIds,
                    selectedFileDataElements,
                    selectedFilePropertyById,
                    mappingByFileKey,
                    dateFrom: "",
                    dateTo: "",
                }),
            {
                wrapper: ({ children }) => (
                    <AppContext.Provider value={context as any}>{children}</AppContext.Provider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current.quickPreviewState.status).toBe("success");
        });

        const byKey = result.current.quickPreviewByFileKey;
        expect(byKey["de-file"]).toBeDefined();
        expect(byKey["de-file-b"]).toBeDefined();

        // Expect the resolved values to contain the example file names from ProgramTestRepository
        expect(byKey["de-file"]).toEqual(expect.arrayContaining([expect.stringContaining("visit-form.pdf")]));
        expect(byKey["de-file-b"]).toEqual(expect.arrayContaining([expect.stringContaining("consent-form.pdf")]));
    });

    it("returns preview entries for each data element even when events have files for only one element each", async () => {
        const selectedFileDataElements: ProgramFileProperty[] = [
            new ProgramFileProperty({
                id: "de-file",
                name: "Visit Form",
                valueType: "FILE_RESOURCE",
                sourceType: "dataElement",
                sourceContainerId: "stage-1",
                sourceContainerName: "Main Stage",
            }),
            new ProgramFileProperty({
                id: "de-file-b",
                name: "Consent Form",
                valueType: "FILE_RESOURCE",
                sourceType: "dataElement",
                sourceContainerId: "stage-1",
                sourceContainerName: "Main Stage",
            }),
        ];

        const selectedFileDataValueIds = ["de-file", "de-file-b"];
        const selectedFilePropertyById = Object.fromEntries(
            selectedFileDataElements.map(p => [p.id, p])
        );
        const mappingByFileKey: Record<string, string> = {
            "de-file": "{fileName}",
            "de-file-b": "{fileName}",
        };

        // Use ou-b which has events split across data elements (evt-4: de-file only, evt-5: de-file-b only)
        const { result } = renderHook(
            () =>
                useWizardTemplatePreviewData({
                    currentStepId: "preview",
                    selectedProgramId: "prog-a",
                    selectedOrgUnitId: "ou-b",
                    orgUnitSelectionMode: "selected",
                    selectedFileDataValueIds,
                    selectedFileDataElements,
                    selectedFilePropertyById,
                    mappingByFileKey,
                    dateFrom: "",
                    dateTo: "",
                }),
            {
                wrapper: ({ children }) => (
                    <AppContext.Provider value={context as any}>{children}</AppContext.Provider>
                ),
            }
        );

        await waitFor(() => {
            expect(result.current.quickPreviewState.status).toBe("success");
        });

        const byKey = result.current.quickPreviewByFileKey;

        // evt-4 has only de-file, evt-5 has only de-file-b — per-element filtering must find both
        expect(byKey["de-file"]?.length).toBeGreaterThanOrEqual(1);
        expect(byKey["de-file-b"]?.length).toBeGreaterThanOrEqual(1);
        expect(byKey["de-file"]).toEqual(expect.arrayContaining([expect.stringContaining("visit-form-2.pdf")]));
        expect(byKey["de-file-b"]).toEqual(expect.arrayContaining([expect.stringContaining("consent-form-2.pdf")]));
    });
});
