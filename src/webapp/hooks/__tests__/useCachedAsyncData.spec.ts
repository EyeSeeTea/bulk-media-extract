import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useCachedAsyncData } from "$/webapp/hooks/useCachedAsyncData";

describe("useCachedAsyncData", () => {
    it("returns idle state when key is empty", async () => {
        const asyncFunction = vi.fn(async () => "value");

        const { result } = renderHook(() => useCachedAsyncData("", asyncFunction));

        await waitFor(() => {
            expect(result.current.state).toEqual({ status: "idle" });
        });
        expect(asyncFunction).not.toHaveBeenCalled();
    });

    it("fetches and stores value on cache miss", async () => {
        const asyncFunction = vi.fn(async () => "value");

        const { result } = renderHook(() => useCachedAsyncData("key-a", asyncFunction));

        await waitFor(() => {
            expect(result.current.state).toEqual({ status: "success", data: "value" });
        });
        expect(asyncFunction).toHaveBeenCalledTimes(1);
    });

    it("returns cached value when cache key stays the same", async () => {
        const asyncFunction = vi.fn(async () => "value");

        const { result } = renderHook(() => useCachedAsyncData("key-a", asyncFunction));

        await waitFor(() => {
            expect(result.current.state).toEqual({ status: "success", data: "value" });
        });

        await act(async () => {
            await result.current.execute();
        });

        expect(asyncFunction).toHaveBeenCalledTimes(1);
        expect(result.current.state).toEqual({ status: "success", data: "value" });
    });

    it("fetches again when cache key changes", async () => {
        const asyncFunction = vi.fn(async () => "value");

        const { rerender } = renderHook(
            ({ keyValue }) => useCachedAsyncData(keyValue, asyncFunction),
            {
                initialProps: { keyValue: "key-a" },
            }
        );

        await waitFor(() => {
            expect(asyncFunction).toHaveBeenCalledTimes(1);
        });

        rerender({ keyValue: "key-b" });

        await waitFor(() => {
            expect(asyncFunction).toHaveBeenCalledTimes(2);
        });
    });
});
