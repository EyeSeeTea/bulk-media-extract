import { describe, expect, it, vi } from "vitest";
import { BrowserLocalDirectoryGateway } from "$/data/storage/BrowserLocalDirectoryGateway";

describe("BrowserLocalDirectoryGateway", () => {
    const gateway = new BrowserLocalDirectoryGateway();

    it("detects whether the browser supports directory picking", () => {
        const originalShowDirectoryPicker = window.showDirectoryPicker;

        expect(gateway.supportsDirectorySelection()).toBe(false);

        window.showDirectoryPicker = vi.fn();
        expect(gateway.supportsDirectorySelection()).toBe(true);

        window.showDirectoryPicker = originalShowDirectoryPicker;
    });

    it("selects the local directory through the browser API", async () => {
        const originalShowDirectoryPicker = window.showDirectoryPicker;
        const directoryHandle = { name: "exports" } as FileSystemDirectoryHandle;

        window.showDirectoryPicker = vi.fn().mockResolvedValue(directoryHandle);

        await expect(gateway.selectDirectory()).resolves.toBe(directoryHandle);

        window.showDirectoryPicker = originalShowDirectoryPicker;
    });

    it("validates local directory access by requesting write permission when needed", async () => {
        const queryPermission = vi.fn().mockResolvedValue("prompt");
        const requestPermission = vi.fn().mockResolvedValue("granted");
        const directoryHandle = {
            queryPermission,
            requestPermission,
        } as unknown as FileSystemDirectoryHandle;
        const originalShowDirectoryPicker = window.showDirectoryPicker;

        window.showDirectoryPicker = vi.fn();

        await expect(gateway.validateDirectoryAccess(directoryHandle)).resolves.toBeUndefined();
        expect(queryPermission).toHaveBeenCalledWith({ mode: "readwrite" });
        expect(requestPermission).toHaveBeenCalledWith({ mode: "readwrite" });

        window.showDirectoryPicker = originalShowDirectoryPicker;
    });

    it("fails validation when directory access is denied", async () => {
        const directoryHandle = {
            queryPermission: vi.fn().mockResolvedValue("prompt"),
            requestPermission: vi.fn().mockResolvedValue("denied"),
        } as unknown as FileSystemDirectoryHandle;
        const originalShowDirectoryPicker = window.showDirectoryPicker;

        window.showDirectoryPicker = vi.fn();

        await expect(gateway.validateDirectoryAccess(directoryHandle)).rejects.toThrow(
            "Local directory validation failed. The browser did not grant write access to the selected directory."
        );

        window.showDirectoryPicker = originalShowDirectoryPicker;
    });

    it("writes nested target paths under the selected root directory", async () => {
        const write = vi.fn().mockResolvedValue(undefined);
        const close = vi.fn().mockResolvedValue(undefined);
        const createWritable = vi.fn().mockResolvedValue({
            write,
            close,
            abort: vi.fn(),
        });
        const getFileHandle = vi.fn().mockResolvedValue({
            createWritable,
        });
        const leafDirectoryHandle = {
            getFileHandle,
        };
        const nestedDirectoryHandle = {
            getDirectoryHandle: vi.fn().mockResolvedValue(leafDirectoryHandle),
            getFileHandle: vi.fn(),
        };
        const rootDirectory = {
            getDirectoryHandle: vi.fn().mockResolvedValue(nestedDirectoryHandle),
            getFileHandle: vi.fn(),
        } as unknown as FileSystemDirectoryHandle;
        const controller = new AbortController();
        const response = new Response(new Blob(["file-content"], { type: "application/pdf" }));

        await gateway.writeResponse({
            rootDirectory,
            targetPath: "/exports/forms/visit.pdf",
            response,
            signal: controller.signal,
        });

        expect(rootDirectory.getDirectoryHandle).toHaveBeenCalledWith("exports", { create: true });
        expect(nestedDirectoryHandle.getDirectoryHandle).toHaveBeenCalledWith("forms", {
            create: true,
        });
        expect(getFileHandle).toHaveBeenCalledWith("visit.pdf", { create: true });
        expect(write).toHaveBeenCalledTimes(1);
        expect(close).toHaveBeenCalledTimes(1);
    });
});
