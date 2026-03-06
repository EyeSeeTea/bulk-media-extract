import React from "react";
import { AsyncData } from "$/webapp/hooks/useAsyncData";

type UseCachedAsyncDataOptions = {
    enabled?: boolean;
};

/**
 * Executes async operations and caches successful results by cache key.
 */
export function useCachedAsyncData<TData>(
    cacheKey: string | undefined,
    asyncFunction: () => Promise<TData>,
    options: UseCachedAsyncDataOptions = {}
) {
    const { enabled = true } = options;
    const cacheRef = React.useRef(new Map<string, TData>());
    const [state, setState] = React.useState<AsyncData<TData>>({ status: "idle" });

    const execute = React.useCallback(async (): Promise<void> => {
        if (!enabled || !cacheKey) {
            setState({ status: "idle" });
            return;
        }

        const cachedData = cacheRef.current.get(cacheKey);
        if (cachedData) {
            setState({ status: "success", data: cachedData });
            return;
        }

        setState({ status: "loading" });

        try {
            const data = await asyncFunction();
            cacheRef.current.set(cacheKey, data);
            setState({ status: "success", data });
        } catch (error) {
            setState({ status: "error", error: getErrorMessage(error) });
        }
    }, [cacheKey, enabled, asyncFunction]);

    React.useEffect(() => {
        void execute();
    }, [execute]);

    return { state, execute };
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return "Unknown error";
}
