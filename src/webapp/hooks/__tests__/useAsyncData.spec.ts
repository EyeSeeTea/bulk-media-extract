import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAsyncData } from "$/webapp/hooks/useAsyncData";

describe("useAsyncData", () => {
    it("starts in idle state", () => {
        const { result } = renderHook(() => useAsyncData(async () => "ok"));

        expect(result.current.state).toEqual({ status: "idle" });
    });

    it("transitions to success after execute", async () => {
        const { result } = renderHook(() => useAsyncData(async () => "data"));

        await result.current.execute();

        await waitFor(() => {
            expect(result.current.state).toEqual({ status: "success", data: "data" });
        });
    });

    it("transitions to error after failure", async () => {
        const { result } = renderHook(() =>
            useAsyncData(async () => {
                throw new Error("boom");
            })
        );

        await result.current.execute();

        await waitFor(() => {
            expect(result.current.state).toEqual({ status: "error", error: "boom" });
        });
    });

    it("auto executes when enabled", async () => {
        const asyncFunction = vi.fn(async () => "auto");

        const { result } = renderHook(() =>
            useAsyncData(asyncFunction, {
                autoExecute: true,
            })
        );

        await waitFor(() => {
            expect(result.current.state).toEqual({ status: "success", data: "auto" });
        });
        expect(asyncFunction).toHaveBeenCalledTimes(1);
    });
});
