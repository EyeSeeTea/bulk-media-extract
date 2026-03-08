import { Future } from "$/domain/entities/generic/Future";
import {
    FileCapableProgram,
    ProgramEventPreview,
    ProgramFilePropertyGroup,
    ProgramFileProperties,
    ProgramFileProperty,
} from "$/domain/entities/FileExportProgram";
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
                sourceType: "metadata",
            }),
            new ProgramFileProperty({
                id: "enrollmentDate",
                name: "Enrollment/event date",
                valueType: "DATE",
                sourceType: "metadata",
            }),
            new ProgramFileProperty({
                id: "orgUnitId",
                name: "Organisation unit id",
                valueType: "TEXT",
                sourceType: "metadata",
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
                id: "attr-image",
                name: "Patient Photo",
                valueType: "IMAGE",
                sourceType: "trackedEntityAttribute",
            }),
        ],
        propertyGroups: [
            new ProgramFilePropertyGroup({
                id: "metadata",
                name: "Metadata",
                sourceType: "metadata",
                properties: [
                    new ProgramFileProperty({
                        id: "orgUnitName",
                        name: "Organisation unit name",
                        valueType: "TEXT",
                        sourceType: "metadata",
                    }),
                    new ProgramFileProperty({
                        id: "enrollmentDate",
                        name: "Enrollment/event date",
                        valueType: "DATE",
                        sourceType: "metadata",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitId",
                        name: "Organisation unit id",
                        valueType: "TEXT",
                        sourceType: "metadata",
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
                sourceType: "metadata",
            }),
            new ProgramFileProperty({
                id: "enrollmentDate",
                name: "Enrollment/event date",
                valueType: "DATE",
                sourceType: "metadata",
            }),
            new ProgramFileProperty({
                id: "orgUnitId",
                name: "Organisation unit id",
                valueType: "TEXT",
                sourceType: "metadata",
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
                id: "metadata",
                name: "Metadata",
                sourceType: "metadata",
                properties: [
                    new ProgramFileProperty({
                        id: "orgUnitName",
                        name: "Organisation unit name",
                        valueType: "TEXT",
                        sourceType: "metadata",
                    }),
                    new ProgramFileProperty({
                        id: "enrollmentDate",
                        name: "Enrollment/event date",
                        valueType: "DATE",
                        sourceType: "metadata",
                    }),
                    new ProgramFileProperty({
                        id: "orgUnitId",
                        name: "Organisation unit id",
                        valueType: "TEXT",
                        sourceType: "metadata",
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
            dataValues: { "de-file": "file-123" },
            fileValues: { "de-file": "file-123" },
        }),
    ],
    "prog-b:ou-b": [
        new ProgramEventPreview({
            id: "evt-2",
            eventDate: "2026-01-12",
            orgUnitId: "ou-b",
            orgUnitName: "North District",
            dataValues: { "de-file-b": "file-555" },
            fileValues: { "de-file-b": "file-555" },
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
        pageSize: number
    ): FutureData<ProgramEventPreview[]> {
        const key = `${programId}:${orgUnitId}`;
        const rows = PREVIEW_BY_KEY[key] ?? [];
        return Future.success(rows.slice(0, pageSize));
    }

    public getOrganisationUnits(): FutureData<NamedRef[]> {
        return Future.success(ORG_UNITS);
    }
}
