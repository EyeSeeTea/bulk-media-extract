import { describe, expect, it, vi } from "vitest";
import { runExecutionPlan } from "$/webapp/pages/wizard/executionRunner";
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
        totalPreviewRows: 3,
        exportableOperations: 3,
        skippedMissingFileResource: 0,
    },
    operations: [
        {
            source: {
                url: "https://example.org/file-1",
                fileResourceId: "file-1",
                fileSize: 1024,
            },
            target: {
                path: "/exports/one.pdf",
            },
        },
        {
            source: {
                url: "https://example.org/file-2",
                fileResourceId: "file-2",
                fileSize: 2048,
            },
            target: {
                path: "/exports/two.pdf",
            },
        },
        {
            source: {
                url: "https://example.org/file-3",
                fileResourceId: "file-3",
                fileSize: 4096,
            },
            target: {
                path: "/exports/three.pdf",
            },
        },
    ],
};

describe("executionRunner", () => {
    it("reports progress across multiple operations and records partial failures", async () => {
        const progressSnapshots: Array<{
            processed: number;
            total: number;
            successCount: number;
            failureCount: number;
            percentage: number;
            currentTargetPath?: string;
        }> = [];
        const stateChanges: string[] = [];
        const uploads = new Map([
            ["/exports/one.pdf", Promise.resolve()],
            ["/exports/two.pdf", Promise.reject(new Error("Upload failed"))],
            ["/exports/three.pdf", Promise.resolve()],
        ]);

        const run = runExecutionPlan({
            configuration,
            storage: {
                url: "https://dav.example.org/remote.php/dav",
                username: "demo",
                password: "secret",
            },
            downloadSourceFile: async () => new Blob(["file"], { type: "application/pdf" }),
            uploadToStorage: ({ targetPath }) => ({
                promise: uploads.get(targetPath) ?? Promise.resolve(),
            }),
            onProgress: snapshot => {
                progressSnapshots.push(snapshot);
            },
            onStateChange: status => {
                stateChanges.push(status);
            },
        });

        const report = await run.done;

        expect(stateChanges).toEqual(["running", "partial-failure"]);
        expect(progressSnapshots).toEqual([
            {
                processed: 0,
                total: 3,
                successCount: 0,
                failureCount: 0,
                percentage: 0,
            },
            {
                processed: 1,
                total: 3,
                successCount: 1,
                failureCount: 0,
                percentage: 33,
                currentTargetPath: "/exports/one.pdf",
            },
            {
                processed: 2,
                total: 3,
                successCount: 1,
                failureCount: 1,
                percentage: 67,
                currentTargetPath: "/exports/two.pdf",
            },
            {
                processed: 3,
                total: 3,
                successCount: 2,
                failureCount: 1,
                percentage: 100,
                currentTargetPath: "/exports/three.pdf",
            },
        ]);
        expect(report.status).toBe("partial-failure");
        expect(report.summary).toEqual({
            totalOperations: 3,
            attemptedOperations: 3,
            successCount: 2,
            failureCount: 1,
        });
    });

    it("marks interrupted runs and preserves completed work", async () => {
        let cancelCurrentUpload: (() => void) | undefined;
        const onProgress = vi.fn();
        const onStateChange = vi.fn();

        const run = runExecutionPlan({
            configuration,
            storage: {
                url: "https://dav.example.org/remote.php/dav",
                username: "demo",
                password: "secret",
            },
            downloadSourceFile: async () => new Blob(["file"], { type: "application/pdf" }),
            uploadToStorage: ({ targetPath }) => {
                if (targetPath === "/exports/one.pdf") {
                    return { promise: Promise.resolve() };
                }

                const promise = new Promise<void>((_resolve, reject) => {
                    cancelCurrentUpload = () => reject(new Error("Execution interrupted by user."));
                });

                return {
                    promise,
                    cancel: () => cancelCurrentUpload?.(),
                };
            },
            onProgress,
            onStateChange,
        });

        await Promise.resolve();
        run.cancel();

        const report = await run.done;

        expect(onStateChange).toHaveBeenCalledWith("running");
        expect(onStateChange).toHaveBeenLastCalledWith("interrupted", expect.objectContaining({
            interrupted: true,
        }));
        expect(report.status).toBe("interrupted");
        expect(report.interrupted).toBe(true);
        expect(report.summary).toEqual({
            totalOperations: 3,
            attemptedOperations: 1,
            successCount: 1,
            failureCount: 0,
        });
    });
});
