import { ProgramD2Repository } from "$/data/repositories/ProgramD2Repository";
import { D2Api } from "$/types/d2-api";
import { describe, expect, it } from "vitest";

describe("ProgramD2Repository", () => {
    it("discovers only file-capable programs across data elements and TE attributes", async () => {
        const api = buildApi({
            "/programs": {
                programs: [
                    {
                        id: "program-a",
                        displayName: "Program A",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [
                            { id: "ou-a", displayName: "Org Unit A", path: "/root/ou-a" },
                        ],
                        programStages: [
                            {
                                id: "stage-a",
                                displayName: "Stage A",
                                programStageDataElements: [
                                    {
                                        dataElement: {
                                            id: "de-a",
                                            displayName: "Attachment",
                                            valueType: "FILE_RESOURCE",
                                        },
                                    },
                                ],
                            },
                        ],
                        programTrackedEntityAttributes: [],
                    },
                    {
                        id: "program-b",
                        displayName: "Program B",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [
                            { id: "ou-b", displayName: "Org Unit B", path: "/root/ou-b" },
                        ],
                        programStages: [],
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute: {
                                    id: "attr-b",
                                    displayName: "Photo",
                                    valueType: "IMAGE",
                                },
                            },
                        ],
                    },
                    {
                        id: "program-c",
                        displayName: "Program C",
                        programType: "WITHOUT_REGISTRATION",
                        organisationUnits: [
                            { id: "ou-c", displayName: "Org Unit C", path: "/root/ou-c" },
                        ],
                        programStages: [],
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute: {
                                    id: "attr-c",
                                    displayName: "Age",
                                    valueType: "NUMBER",
                                },
                            },
                        ],
                    },
                ],
            },
        });

        const repository = new ProgramD2Repository(api);

        const programs = await repository.getFileCapablePrograms().toPromise();

        expect(programs.map(program => program.id)).toEqual(["program-a", "program-b"]);
    });

    it("maps selected program file properties", async () => {
        const api = buildApi({
            "/programs": {
                programs: [
                    {
                        id: "program-a",
                        displayName: "Program A",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [
                            { id: "ou-a", displayName: "Org Unit A", path: "/root/ou-a" },
                        ],
                        programStages: [
                            {
                                id: "stage-a",
                                displayName: "Stage A",
                                programStageDataElements: [
                                    {
                                        dataElement: {
                                            id: "de-a",
                                            displayName: "Attachment",
                                            valueType: "FILE_RESOURCE",
                                        },
                                    },
                                ],
                            },
                        ],
                        programTrackedEntityAttributes: [
                            {
                                trackedEntityAttribute: {
                                    id: "attr-a",
                                    displayName: "Photo",
                                    valueType: "IMAGE",
                                },
                            },
                        ],
                    },
                ],
            },
        });

        const repository = new ProgramD2Repository(api);

        const details = await repository.getProgramFileProperties("program-a").toPromise();

        expect(details.program.programType).toBe("WITH_REGISTRATION");
        expect(details.program.organisationUnits).toEqual([
            { id: "ou-a", name: "Org Unit A", path: "/root/ou-a" },
        ]);
        expect(details.properties.map(property => property.id)).toEqual(
            expect.arrayContaining(["orgUnitName", "enrollmentDate", "de-a", "attr-a"])
        );
        expect(details.propertyGroups.map(group => group.id)).toEqual([
            "metadata",
            "trackedEntityAttributes",
            "stage-a",
        ]);
    });

    it("groups event program properties under event data elements", async () => {
        const api = buildApi({
            "/programs": {
                programs: [
                    {
                        id: "program-e",
                        displayName: "Program E",
                        programType: "WITHOUT_REGISTRATION",
                        organisationUnits: [],
                        programStages: [
                            {
                                id: "stage-e",
                                displayName: "Event Stage",
                                programStageDataElements: [
                                    {
                                        dataElement: {
                                            id: "de-e",
                                            displayName: "Event Attachment",
                                            valueType: "FILE_RESOURCE",
                                        },
                                    },
                                ],
                            },
                        ],
                        programTrackedEntityAttributes: [],
                    },
                ],
            },
        });

        const repository = new ProgramD2Repository(api);
        const details = await repository.getProgramFileProperties("program-e").toPromise();

        expect(details.propertyGroups.map(group => group.id)).toEqual([
            "metadata",
            "eventDataElements",
        ]);
        expect(details.propertyGroups[1]?.properties.map(property => property.id)).toEqual([
            "de-e",
        ]);
    });

    it("maps event preview data", async () => {
        const api = buildApi({
            "/events": {
                events: [
                    {
                        event: "event-1",
                        eventDate: "2026-01-20",
                        orgUnit: "ou-1",
                        orgUnitName: "Org Unit One",
                        dataValues: [{ dataElement: "de-a", value: "file-1" }],
                    },
                ],
            },
        });

        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", 20)
            .toPromise();

        expect(events).toHaveLength(1);
        expect(events[0]?.orgUnitName).toBe("Org Unit One");
        expect(events[0]?.dataValues["de-a"]).toBe("file-1");
        expect(events[0]?.fileValues["de-a"]).toBe("file-1");
    });

    it("propagates API errors", async () => {
        const api = buildApi({}, new Error("api-down"));
        const repository = new ProgramD2Repository(api);

        await expect(repository.getFileCapablePrograms().toPromise()).rejects.toThrow("api-down");
    });
});

function buildApi(responses: Record<string, unknown>, forcedError?: Error): D2Api {
    const api = {
        get: <T>(path: string) => {
            return {
                getData: async () => {
                    if (forcedError) {
                        throw forcedError;
                    }

                    const key = Object.keys(responses).find(responsePath =>
                        path.startsWith(responsePath)
                    );
                    if (!key) {
                        return {} as T;
                    }
                    return responses[key] as T;
                },
                cancel: () => {},
            };
        },
    };

    return api as unknown as D2Api;
}
