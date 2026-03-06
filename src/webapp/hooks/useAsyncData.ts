import React from "react";
import i18n from "$/utils/i18n";

export type AsyncData<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; error: string };

type UseAsyncDataOptions<TArgs extends unknown[]> = {
    autoExecute?: boolean;
    autoExecuteArgs?: TArgs;
    deps?: React.DependencyList;
};

/**
 * Manages async operation lifecycle with idle/loading/success/error states.
 */
export function useAsyncData<TData, TArgs extends unknown[]>(
    asyncFunction: (...args: TArgs) => Promise<TData>,
    options: UseAsyncDataOptions<TArgs> = {}
) {
    const { autoExecute = false, autoExecuteArgs, deps = [] } = options;

    const [state, setState] = React.useState<AsyncData<TData>>({ status: "idle" });

    const execute = React.useCallback(
        async (...args: TArgs): Promise<void> => {
            setState({ status: "loading" });

            try {
                const data = await asyncFunction(...args);
                setState({ status: "success", data });
            } catch (error) {
                setState({ status: "error", error: getErrorMessage(error) });
            }
        },
        [asyncFunction]
    );

    React.useEffect(() => {
        if (!autoExecute) {
            return;
        }

        void execute(...((autoExecuteArgs ?? []) as TArgs));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoExecute, execute, ...deps]);

    return { state, execute, setState };
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    return i18n.t("Unknown error");
}
