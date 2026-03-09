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
            "/programs": {
                programs: [
                    {
                        id: "program-a",
                        displayName: "Program A",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [],
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
                                    {
                                        dataElement: {
                                            id: "de-text",
                                            displayName: "Comment",
                                            valueType: "TEXT",
                                        },
                                    },
                                ],
                            },
                        ],
                        programTrackedEntityAttributes: [],
                    },
                ],
            },
            "/tracker/events": {
                total: 3,
                pageCount: 2,
                instances: [
                    {
                        event: "event-1",
                        trackedEntity: "tei-1",
                        occurredAt: "2026-01-20",
                        orgUnit: "ou-1",
                        orgUnitName: "Org Unit One",
                        dataValues: [
                            { dataElement: "de-a", value: "file-1" },
                            { dataElement: "de-text", value: "plain-text-value" },
                        ],
                    },
                ],
            },
            "/tracker/trackedEntities": {
                instances: [
                    {
                        trackedEntity: "tei-1",
                        attributes: [{ attribute: "attr-a", value: "attr-value-a" }],
                    },
                ],
            },
            "/fileResources/file-1": {
                id: "file-1",
                originalName: "original-file-name.pdf",
            },
        });

        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", "descendants", "stage-a", "de-a", 20)
            .toPromise();

        expect(events.events).toHaveLength(1);
        expect(events.events[0]?.orgUnitName).toBe("Org Unit One");
        expect(events.events[0]?.dataValues["de-a"]).toBe("file-1");
        expect(events.events[0]?.attributeValues["attr-a"]).toBe("attr-value-a");
        expect(events.events[0]?.fileValues["de-a"]).toBe("file-1");
        expect(events.events[0]?.fileNames["de-a"]).toBe("original-file-name.pdf");
        expect(events.events[0]?.fileNames["de-text"]).toBeUndefined();
        expect(events.total).toBe(3);
        expect(events.pageCount).toBe(2);
    });

    it("maps legacy tracker events payload shape", async () => {
        const api = buildApi({
            "/programs": {
                programs: [
                    {
                        id: "program-a",
                        displayName: "Program A",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [],
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
                ],
            },
            "/tracker/events": {
                pager: {
                    page: 1,
                    pageSize: 10,
                    total: 2,
                    pageCount: 1,
                },
                events: [
                    {
                        event: "event-1",
                        trackedEntity: "tei-1",
                        occurredAt: "2025-01-10T00:00:00.000",
                        orgUnit: "ou-1",
                        dataValues: [{ dataElement: "de-a", value: "file-1" }],
                    },
                ],
            },
            "/tracker/trackedEntities": {
                instances: [
                    {
                        trackedEntity: "tei-1",
                        attributes: [{ attribute: "attr-a", value: "legacy-attr" }],
                    },
                ],
            },
            "/fileResources/file-1": {
                id: "file-1",
                originalName: "original-file-name.pdf",
            },
        });

        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", "descendants", "stage-a", "de-a", 20)
            .toPromise();

        expect(events.events).toHaveLength(1);
        expect(events.events[0]?.eventDate).toBe("2025-01-10T00:00:00.000");
        expect(events.events[0]?.attributeValues["attr-a"]).toBe("legacy-attr");
        expect(events.total).toBe(2);
        expect(events.pageCount).toBe(1);
    });

    it("resolves missing org unit names from organisation unit metadata", async () => {
        const api = buildApi({
            "/programs": {
                programs: [
                    {
                        id: "program-a",
                        displayName: "Program A",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [],
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
                ],
            },
            "/tracker/events": {
                events: [
                    {
                        event: "event-1",
                        trackedEntity: "tei-1",
                        occurredAt: "2025-01-10T00:00:00.000",
                        orgUnit: "ou-1",
                        dataValues: [{ dataElement: "de-a", value: "file-1" }],
                    },
                ],
            },
            "/organisationUnits/ou-1": {
                id: "ou-1",
                displayName: "Resolved Org Unit",
            },
            "/tracker/trackedEntities": {
                instances: [{ trackedEntity: "tei-1", attributes: [] }],
            },
            "/fileResources/file-1": {
                id: "file-1",
                originalName: "original-file-name.pdf",
            },
        });

        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", "descendants", "stage-a", "de-a", 20)
            .toPromise();

        expect(events.events[0]?.orgUnitName).toBe("Resolved Org Unit");
    });

    it("reads tracked entity attributes from legacy trackedEntities payload shape", async () => {
        const api = buildApi({
            "/programs": {
                programs: [
                    {
                        id: "program-a",
                        displayName: "Program A",
                        programType: "WITH_REGISTRATION",
                        organisationUnits: [],
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
                ],
            },
            "/tracker/events": {
                events: [
                    {
                        event: "event-1",
                        trackedEntity: "tei-1",
                        occurredAt: "2025-01-10T00:00:00.000",
                        orgUnit: "ou-1",
                        dataValues: [{ dataElement: "de-a", value: "file-1" }],
                    },
                ],
            },
            "/tracker/trackedEntities": {
                trackedEntities: [
                    {
                        trackedEntity: "tei-1",
                        attributes: [{ attribute: "attr-a", value: "legacy-tei-attr" }],
                    },
                ],
            },
            "/organisationUnits/ou-1": {
                id: "ou-1",
                displayName: "Resolved Org Unit",
            },
            "/fileResources/file-1": {
                id: "file-1",
                originalName: "original-file-name.pdf",
            },
        });

        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", "descendants", "stage-a", "de-a", 20)
            .toPromise();

        expect(events.events[0]?.attributeValues["attr-a"]).toBe("legacy-tei-attr");
    });

    it("does not refetch cached file resource names across preview calls", async () => {
        const api = buildApi(
            {
                "/programs": {
                    programs: [
                        {
                            id: "program-a",
                            displayName: "Program A",
                            programType: "WITH_REGISTRATION",
                            organisationUnits: [],
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
                    ],
                },
                "/tracker/events": {
                    instances: [
                        {
                            event: "event-1",
                            trackedEntity: "tei-1",
                            occurredAt: "2026-01-20",
                            orgUnit: "ou-1",
                            dataValues: [{ dataElement: "de-a", value: "file-1" }],
                        },
                    ],
                },
                "/tracker/trackedEntities": {
                    instances: [{ trackedEntity: "tei-1", attributes: [] }],
                },
                "/fileResources/file-1": {
                    id: "file-1",
                    originalName: "original-file-name.pdf",
                },
            },
            undefined,
            true
        );
        const repository = new ProgramD2Repository(api);

        await repository
            .getProgramEventsPreview("program-a", "ou-1", "selected", "stage-a", "de-a", 20)
            .toPromise();
        await repository
            .getProgramEventsPreview("program-a", "ou-1", "selected", "stage-a", "de-a", 20)
            .toPromise();
        await repository
            .getProgramEventsPreview("program-a", "ou-1", "selected", "stage-a", "de-a", 20)
            .toPromise();

        expect(api.__calls.filter((path: string) => path.startsWith("/fileResources/file-1"))).toHaveLength(1);
    });

    it("keeps preview events when a file resource is missing", async () => {
        const api = buildApi(
            {
                "/programs": {
                    programs: [
                        {
                            id: "program-a",
                            displayName: "Program A",
                            programType: "WITH_REGISTRATION",
                            organisationUnits: [],
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
                    ],
                },
                "/tracker/events": {
                    events: [
                        {
                            event: "event-1",
                            trackedEntity: "tei-1",
                            occurredAt: "2026-01-20",
                            orgUnit: "ou-1",
                            dataValues: [{ dataElement: "de-a", value: "missing-file" }],
                        },
                    ],
                },
                "/tracker/trackedEntities": {
                    instances: [{ trackedEntity: "tei-1", attributes: [] }],
                },
            },
            undefined,
            false,
            ["/fileResources/missing-file"]
        );

        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", "selected", "stage-a", "de-a", 20)
            .toPromise();

        expect(events.events).toHaveLength(1);
        expect(events.events[0]?.fileValues["de-a"]).toBe("missing-file");
        expect(events.events[0]?.fileNames["de-a"]).toBeUndefined();
    });

    it("includes org unit mode in tracker preview query", async () => {
        const api = buildApi(
            {
                "/programs": {
                    programs: [
                        {
                            id: "program-a",
                            displayName: "Program A",
                            programType: "WITH_REGISTRATION",
                            organisationUnits: [],
                            programStages: [],
                            programTrackedEntityAttributes: [],
                        },
                    ],
                },
                "/tracker/events": { instances: [] },
            },
            undefined,
            true
        );
        const repository = new ProgramD2Repository(api);

        await repository
            .getProgramEventsPreview("program-a", "ou-1", "descendants", "stage-a", "de-a", 20)
            .toPromise();

        expect(api.__calls.some((path: string) => path.includes("ouMode=DESCENDANTS"))).toBe(true);
        expect(api.__calls.some((path: string) => path.includes("programStage=stage-a"))).toBe(true);
        expect(api.__calls.some((path: string) => path.includes("filter=de-a%3Agt%3A1"))).toBe(true);
    });

    it("stops loading all pages when subsequent pages repeat the same events", async () => {
        const api = buildApi(
            {
                "/programs": {
                    programs: [
                        {
                            id: "program-a",
                            displayName: "Program A",
                            programType: "WITH_REGISTRATION",
                            organisationUnits: [],
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
                    ],
                },
                "/tracker/events": {
                    total: 500,
                    instances: [
                        {
                            event: "event-1",
                            trackedEntity: "tei-1",
                            occurredAt: "2026-01-20",
                            orgUnit: "ou-1",
                            dataValues: [{ dataElement: "de-a", value: "file-1" }],
                        },
                    ],
                },
                "/tracker/trackedEntities": {
                    instances: [{ trackedEntity: "tei-1", attributes: [] }],
                },
                "/fileResources/file-1": {
                    id: "file-1",
                    originalName: "original-file-name.pdf",
                },
            },
            undefined,
            true
        );
        const repository = new ProgramD2Repository(api);

        const events = await repository
            .getProgramEventsPreview("program-a", "ou-1", "selected", "stage-a", "de-a", 1, true)
            .toPromise();

        expect(events.events).toHaveLength(2);
        expect(api.__calls.filter((path: string) => path.startsWith("/tracker/events?"))).toHaveLength(2);
    });

    it("propagates API errors", async () => {
        const api = buildApi({}, new Error("api-down"));
        const repository = new ProgramD2Repository(api);

        await expect(repository.getFileCapablePrograms().toPromise()).rejects.toThrow("api-down");
    });
});

function buildApi(
    responses: Record<string, unknown>,
    forcedError?: Error,
    withCallLog = false,
    errorPaths: string[] = []
): D2Api & { __calls: string[] } {
    const calls: string[] = [];
    const get = <T>(path: string, params?: Record<string, unknown>) => {
        return {
            getData: async () => {
                if (withCallLog) {
                    calls.push(buildCallPath(path, params));
                }
                if (forcedError) {
                    throw forcedError;
                }
                if (errorPaths.some(errorPath => path.startsWith(errorPath))) {
                    throw new Error(`Not found: ${path}`);
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
    };

    const api = {
        get: <T>(path: string, params?: Record<string, unknown>) => {
            return get<T>(path, params);
        },
        tracker: {
            events: {
                get: <T>(params: Record<string, unknown>) => get<T>("/tracker/events", params),
            },
            trackedEntities: {
                get: <T>(params: Record<string, unknown>) =>
                    get<T>("/tracker/trackedEntities", params),
            },
        },
        __calls: calls,
    };

    return api as unknown as D2Api & { __calls: string[] };
}

function buildCallPath(path: string, params?: Record<string, unknown>): string {
    if (!params) {
        return path;
    }

    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(item => searchParams.append(key, String(item)));
            return;
        }

        searchParams.set(key, String(value));
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
}
