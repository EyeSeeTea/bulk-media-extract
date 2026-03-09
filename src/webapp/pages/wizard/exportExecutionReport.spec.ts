import { describe, expect, it } from "vitest";
import {
    buildExecutionReport,
    buildExecutionReportFilename,
} from "$/webapp/pages/wizard/exportExecutionReport";
import { ExportExecutionConfiguration } from "$/webapp/pages/wizard/exportExecutionConfiguration";

const configuration: ExportExecutionConfiguration = {
    version: "1",
    generatedAt: "2026-03-09T10:20:30.000Z",
    scope: {
        program: {
            id: "prog-a",
            name: "Antenatal Visit",
        },
        orgUnit: {
            id: "ou-a",
            name: "Central Clinic",
            mode: "descendants",
        },
        dateRange: {},
        fileMappings: [],
    },
    summary: {
        totalPreviewRows: 2,
        exportableOperations: 2,
        skippedMissingFileResource: 0,
    },
    operations: [
        {
            source: {
                url: "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file/file",
                fileResourceId: "file-123",
                fileSize: 1024,
            },
            target: {
                path: "/exports/visit-form.pdf",
            },
        },
        {
            source: {
                url: "http://localhost:8081/dhis2/api/41/tracker/events/evt-1/dataValues/de-file-b/file",
                fileResourceId: "file-456",
                fileSize: 2048,
            },
            target: {
                path: "/exports/consent-form.pdf",
            },
        },
    ],
};

describe("exportExecutionReport", () => {
    it("builds a mixed-result execution report", () => {
        const firstOperation = configuration.operations[0];
        const secondOperation = configuration.operations[1];
        if (!firstOperation || !secondOperation) {
            throw new Error("Test configuration is invalid");
        }

        const report = buildExecutionReport({
            configuration,
            startedAt: "2026-03-09T11:00:00.000Z",
            finishedAt: "2026-03-09T11:01:00.000Z",
            status: "partial-failure",
            interrupted: false,
            results: [
                {
                    operationIndex: 0,
                    source: firstOperation.source,
                    target: firstOperation.target,
                    status: "success",
                    completedAt: "2026-03-09T11:00:10.000Z",
                },
                {
                    operationIndex: 1,
                    source: secondOperation.source,
                    target: secondOperation.target,
                    status: "failure",
                    completedAt: "2026-03-09T11:00:30.000Z",
                    error: "Upload failed for /exports/consent-form.pdf",
                },
            ],
        });

        expect(report.summary).toEqual({
            totalOperations: 2,
            attemptedOperations: 2,
            successCount: 1,
            failureCount: 1,
        });
        expect(report.status).toBe("partial-failure");
        expect(report.results[1]?.error).toContain("Upload failed");
    });

    it("marks interrupted reports explicitly", () => {
        const firstOperation = configuration.operations[0];
        if (!firstOperation) {
            throw new Error("Test configuration is invalid");
        }

        const report = buildExecutionReport({
            configuration,
            startedAt: "2026-03-09T11:00:00.000Z",
            finishedAt: "2026-03-09T11:00:05.000Z",
            status: "interrupted",
            interrupted: true,
            results: [
                {
                    operationIndex: 0,
                    source: firstOperation.source,
                    target: firstOperation.target,
                    status: "success",
                    completedAt: "2026-03-09T11:00:03.000Z",
                },
            ],
        });

        expect(report.interrupted).toBe(true);
        expect(report.summary).toEqual({
            totalOperations: 2,
            attemptedOperations: 1,
            successCount: 1,
            failureCount: 0,
        });
    });

    it("builds deterministic execution report filenames", () => {
        expect(buildExecutionReportFilename("prog-a", "2026-03-09T11:00:00.000Z")).toBe(
            "export-execution-report-prog-a-2026-03-09T11-00-00-000Z.json"
        );
    });
});
