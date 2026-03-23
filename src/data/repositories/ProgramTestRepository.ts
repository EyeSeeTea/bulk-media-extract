import { Future } from "$/domain/entities/generic/Future";
import { OrgUnitSelectionMode } from "$/application/export/OrgUnitSelectionMode";
import { FileCapableProgram } from "$/domain/entities/FileCapableProgram";
import { ProgramEventPreview } from "$/domain/entities/ProgramEventPreview";
import { ProgramEventsPreviewResult } from "$/domain/entities/ProgramEventsPreviewResult";
import { ProgramFilePropertyGroup } from "$/domain/entities/ProgramFilePropertyGroup";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { NamedRef } from "$/domain/entities/Ref";
import { ProgramRepository } from "$/domain/repositories/ProgramRepository";
import { FutureData } from "$/data/api-futures";

const PROGRAM_A = new FileCapableProgram({
    id: "prog-a",
    name: "Antenatal Visit",
    programType: "WITH_REGISTRATION",
    organisationUnits: [{ id: "ou-a", name: "Central Clinic", path: "/root/ou-a" }],
});
const PROGRAM_B = new FileCapableProgram({
    id: "prog-b",
    name: "Community Outreach",
    programType: "WITHOUT_REGISTRATION",
    organisationUnits: [{ id: "ou-b", name: "North District", path: "/root/ou-b" }],
});
const PROGRAMS = [PROGRAM_A, PROGRAM_B];

const PROGRAM_PROPERTIES: Record<string, ProgramFileProperties> = {
    "prog-a": new ProgramFileProperties({
        program: PROGRAM_A,
        properties: [
            new ProgramFileProperty({
                id: "orgUnitName",
                name: "Organisation unit name",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitId",
                name: "Organisation unit id",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitCode",
                name: "Organisation unit code",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitShortName",
                name: "Organisation unit short name",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitPath",
                name: "Organisation unit path",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitLevel",
                name: "Organisation unit level",
                valueType: "NUMBER",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "ou-attr-zone",
                name: "Zone",
                valueType: "TEXT",
                sourceType: "organisationUnitAttribute",
            }),
            new ProgramFileProperty({
                id: "enrollmentDate",
                name: "Enrollment/event date",
                valueType: "DATE",
                sourceType: "event",
            }),
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
            new ProgramFileProperty({
                id: "attr-image",
                name: "Patient Photo",
                valueType: "IMAGE",
                sourceType: "trackedEntityAttribute",
            }),
            new ProgramFileProperty({
                id: "de-other-stage-text",
                name: "Follow-up note",
                valueType: "TEXT",
                sourceType: "dataElement",
                sourceContainerId: "stage-2",
                sourceContainerName: "Follow-up Stage",
            }),
        ],
        propertyGroups: [
            new ProgramFilePropertyGroup({
                id: "organisationUnit",
                name: "Organisation unit",
                sourceType: "organisationUnit",
                properties: [
                    new ProgramFileProperty({
                        id: "orgUnitName",
                        name: "Organisation unit name",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitId",
                        name: "Organisation unit id",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitCode",
                        name: "Organisation unit code",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitShortName",
                        name: "Organisation unit short name",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitPath",
                        name: "Organisation unit path",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitLevel",
                        name: "Organisation unit level",
                        valueType: "NUMBER",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "ou-attr-zone",
                        name: "Zone",
                        valueType: "TEXT",
                        sourceType: "organisationUnitAttribute",
                    }),
                ],
            }),
            new ProgramFilePropertyGroup({
                id: "event",
                name: "Event",
                sourceType: "event",
                properties: [
                    new ProgramFileProperty({
                        id: "enrollmentDate",
                        name: "Enrollment/event date",
                        valueType: "DATE",
                        sourceType: "event",
                    }),
                ],
            }),
            new ProgramFilePropertyGroup({
                id: "trackedEntityAttributes",
                name: "Tracked entity attributes",
                sourceType: "trackedEntityAttribute",
                properties: [
                    new ProgramFileProperty({
                        id: "attr-image",
                        name: "Patient Photo",
                        valueType: "IMAGE",
                        sourceType: "trackedEntityAttribute",
                    }),
                ],
            }),
            new ProgramFilePropertyGroup({
                id: "stage-1",
                name: "Main Stage",
                sourceType: "dataElement",
                properties: [
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
                ],
            }),
            new ProgramFilePropertyGroup({
                id: "stage-2",
                name: "Follow-up Stage",
                sourceType: "dataElement",
                properties: [
                    new ProgramFileProperty({
                        id: "de-other-stage-text",
                        name: "Follow-up note",
                        valueType: "TEXT",
                        sourceType: "dataElement",
                        sourceContainerId: "stage-2",
                        sourceContainerName: "Follow-up Stage",
                    }),
                ],
            }),
        ],
    }),
    "prog-b": new ProgramFileProperties({
        program: PROGRAM_B,
        properties: [
            new ProgramFileProperty({
                id: "orgUnitName",
                name: "Organisation unit name",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitId",
                name: "Organisation unit id",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "orgUnitPath",
                name: "Organisation unit path",
                valueType: "TEXT",
                sourceType: "organisationUnit",
            }),
            new ProgramFileProperty({
                id: "enrollmentDate",
                name: "Enrollment/event date",
                valueType: "DATE",
                sourceType: "event",
            }),
            new ProgramFileProperty({
                id: "de-file-b",
                name: "Attachment",
                valueType: "FILE_RESOURCE",
                sourceType: "dataElement",
                sourceContainerId: "stage-2",
                sourceContainerName: "Outreach Stage",
            }),
        ],
        propertyGroups: [
            new ProgramFilePropertyGroup({
                id: "organisationUnit",
                name: "Organisation unit",
                sourceType: "organisationUnit",
                properties: [
                    new ProgramFileProperty({
                        id: "orgUnitName",
                        name: "Organisation unit name",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitId",
                        name: "Organisation unit id",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitPath",
                        name: "Organisation unit path",
                        valueType: "TEXT",
                        sourceType: "organisationUnit",
                    }),
                ],
            }),
            new ProgramFilePropertyGroup({
                id: "event",
                name: "Event",
                sourceType: "event",
                properties: [
                    new ProgramFileProperty({
                        id: "enrollmentDate",
                        name: "Enrollment/event date",
                        valueType: "DATE",
                        sourceType: "event",
                    }),
                ],
            }),
            new ProgramFilePropertyGroup({
                id: "eventDataElements",
                name: "Event data elements",
                sourceType: "dataElement",
                properties: [
                    new ProgramFileProperty({
                        id: "de-file-b",
                        name: "Attachment",
                        valueType: "FILE_RESOURCE",
                        sourceType: "dataElement",
                        sourceContainerId: "stage-2",
                        sourceContainerName: "Outreach Stage",
                    }),
                ],
            }),
        ],
    }),
};

const PREVIEW_BY_KEY: Record<string, ProgramEventPreview[]> = {
    "prog-a:ou-a": [
        new ProgramEventPreview({
            id: "evt-1",
            eventDate: "2026-01-10",
            orgUnitId: "ou-a",
            orgUnitName: "Central Clinic",
            orgUnitCode: "CC",
            orgUnitShortName: "Central",
            orgUnitPath: "/root/ou-a",
            orgUnitLevel: 2,
            orgUnitAttributeValues: { "ou-attr-zone": "Urban" },
            dataValues: { "de-file": "file-123", "de-file-b": "file-456" },
            attributeValues: { "attr-image": "patient-photo.jpg" },
            fileValues: { "de-file": "file-123", "de-file-b": "file-456" },
            fileNames: { "de-file": "visit-form.pdf", "de-file-b": "consent-form.pdf" },
            fileSizes: { "de-file": 1024, "de-file-b": 2048 },
        }),
        new ProgramEventPreview({
            id: "evt-2",
            eventDate: "2026-01-11",
            orgUnitId: "ou-a",
            orgUnitName: "Central Clinic",
            orgUnitCode: "CC",
            orgUnitShortName: "Central",
            orgUnitPath: "/root/ou-a",
            orgUnitLevel: 2,
            orgUnitAttributeValues: { "ou-attr-zone": "Urban" },
            dataValues: { "de-file-b": "missing-resource-value" },
            attributeValues: { "attr-image": "patient-photo-2.jpg" },
            fileValues: { "de-file-b": "missing-resource-value" },
            fileNames: {},
            fileSizes: {},
        }),
    ],
    "prog-a:ou-b": [
        new ProgramEventPreview({
            id: "evt-4",
            eventDate: "2026-01-13",
            orgUnitId: "ou-b",
            orgUnitName: "North District",
            orgUnitPath: "/root/ou-b",
            orgUnitAttributeValues: {},
            dataValues: { "de-file": "file-789" },
            attributeValues: {},
            fileValues: { "de-file": "file-789" },
            fileNames: { "de-file": "visit-form-2.pdf" },
            fileSizes: { "de-file": 512 },
        }),
        new ProgramEventPreview({
            id: "evt-5",
            eventDate: "2026-01-14",
            orgUnitId: "ou-b",
            orgUnitName: "North District",
            orgUnitPath: "/root/ou-b",
            orgUnitAttributeValues: {},
            dataValues: { "de-file-b": "file-999" },
            attributeValues: {},
            fileValues: { "de-file-b": "file-999" },
            fileNames: { "de-file-b": "consent-form-2.pdf" },
            fileSizes: { "de-file-b": 768 },
        }),
    ],
    "prog-b:ou-b": [
        new ProgramEventPreview({
            id: "evt-3",
            eventDate: "2026-01-12",
            orgUnitId: "ou-b",
            orgUnitName: "North District",
            orgUnitPath: "/root/ou-b",
            orgUnitAttributeValues: {},
            dataValues: { "de-file-b": "file-555" },
            attributeValues: {},
            fileValues: { "de-file-b": "file-555" },
            fileNames: { "de-file-b": "outreach-attachment.jpg" },
            fileSizes: { "de-file-b": 2048 },
        }),
    ],
};

const ORG_UNITS: NamedRef[] = [
    { id: "ou-a", name: "Central Clinic", path: "/root/ou-a" },
    { id: "ou-b", name: "North District", path: "/root/ou-b" },
];

export class ProgramTestRepository implements ProgramRepository {
    public getFileCapablePrograms(): FutureData<FileCapableProgram[]> {
        return Future.success(PROGRAMS);
    }

    public getProgramFileProperties(programId: string): FutureData<ProgramFileProperties> {
        const details = PROGRAM_PROPERTIES[programId];
        if (!details) {
            return Future.error(new Error(`Program not found: ${programId}`));
        }
        return Future.success(details);
    }

    public getProgramEventsPreview(
        programId: string,
        orgUnitId: string,
        _orgUnitMode: OrgUnitSelectionMode,
        _programStageId: string | undefined,
        _fileDataElementId: string | undefined,
        pageSize: number,
        _loadAllPages = false
    ): FutureData<ProgramEventsPreviewResult> {
        const key = `${programId}:${orgUnitId}`;
        const rows = PREVIEW_BY_KEY[key] ?? [];
        return Future.success(
            new ProgramEventsPreviewResult({
                events: rows.slice(0, pageSize),
                total: rows.length,
                pageCount: rows.length === 0 ? 0 : 1,
            })
        );
    }

    public getOrganisationUnits(): FutureData<NamedRef[]> {
        return Future.success(ORG_UNITS);
    }
}
