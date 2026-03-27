import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Provider } from "@dhis2/app-runtime";
import { D2Api } from "$/types/d2-api";
import { Dhis2Version, loadDhis2Version } from "$/webapp/utils/dhis2Version";
import { App } from "./App";
import { CompositionRoot, getWebappCompositionRoot } from "$/CompositionRoot";

type InitData = {
    compositionRoot: CompositionRoot;
    baseUrl: string;
    dhis2Version: Dhis2Version;
};

type InitState =
    | { type: "loading" }
    | { type: "loaded"; data: InitData }
    | { type: "error"; error: { baseUrl: string; error: Error } };

export function Dhis2App(_props: {}) {
    const [initState, setInitState] = React.useState<InitState>({ type: "loading" });
    const [baseUrl, setBaseUrl] = React.useState<string | null>(getBaseUrlSync);

    React.useEffect(() => {
        if (!baseUrl) return;
        let ignore = false;
        initializeApp(baseUrl).then(state => {
            if (!ignore) setInitState(state);
        });
        return () => {
            ignore = true;
        };
    }, [baseUrl]);

    const onResolved = React.useCallback((url: string) => setBaseUrl(url), []);
    const onError = React.useCallback(
        (error: Error) =>
            setInitState({ type: "error", error: { baseUrl: baseUrl ?? "", error } }),
        [baseUrl]
    );

    if (!baseUrl) {
        return <BaseUrlFallback onResolved={onResolved} onError={onError} />;
    }

    if (initState.type === "error") {
        const { baseUrl: errUrl, error } = initState.error;
        return (
            <div style={{ margin: 20 }}>
                <h3>{error.message}</h3>
                {errUrl ? (
                    <a rel="noopener noreferrer" target="_blank" href={errUrl}>
                        Login {errUrl}
                    </a>
                ) : null}
            </div>
        );
    }

    type ProviderProps = React.ComponentProps<typeof Provider>;
    const config: ProviderProps["config"] = { baseUrl, apiVersion: 30 };

    return (
        <Provider
            config={config}
            plugin={false}
            parentAlertsAdd={() => {}}
            showAlertsInPlugin={false}
        >
            <App
                initData={initState.type === "loaded" ? initState.data : undefined}
                baseUrl={baseUrl}
            />
        </Provider>
    );
}

function BaseUrlFallback(props: {
    onResolved: (url: string) => void;
    onError: (error: Error) => void;
}) {
    React.useEffect(() => {
        getBaseUrlFromManifest().then(props.onResolved).catch(props.onError);
    }, [props.onResolved, props.onError]);

    return null;
}

async function initializeApp(baseUrl: string): Promise<InitState> {
    try {
        const auth = env["VITE_DHIS2_AUTH"];
        const [username = "", password = ""] = auth.split(":");
        const api = auth
            ? new D2Api({ baseUrl: baseUrl, auth: { username, password } })
            : new D2Api({ baseUrl: baseUrl });
        const compositionRoot = getWebappCompositionRoot(api);

        const [userSettings, dhis2Version] = await Promise.all([
            api.get<{ keyUiLocale: string }>("/userSettings").getData(),
            loadDhis2Version(api),
        ]);
        configI18n(userSettings);

        return { type: "loaded", data: { baseUrl, compositionRoot, dhis2Version } };
    } catch (err) {
        return { type: "error", error: { baseUrl, error: err as Error } };
    }
}

const env = import.meta.env;
const isDev = env.DEV;

function getBaseUrlSync(): string | null {
    if (isDev) {
        return "/dhis2";
    }
    return getInjectedBaseUrl();
}

async function getBaseUrlFromManifest(): Promise<string> {
    const response = await fetch("manifest.webapp");
    const manifest = await response.json();
    const { href } = manifest.activities.dhis;

    if (!href || href === "*") {
        throw new Error("Base URL not found in manifest.webapp (see DHIS2-19708)");
    } else {
        return href;
    }
}

function getInjectedBaseUrl() {
    const baseUrl = document.querySelector('meta[name="dhis2-base-url"]')?.getAttribute("content");

    if (baseUrl && baseUrl !== "__DHIS2_BASE_URL__") {
        return baseUrl;
    } else {
        return null;
    }
}

const isLangRTL = (code: string) => {
    const langs = ["ar", "fa", "ur"];
    const prefixed = langs.map(c => `${c}-`);
    return langs.includes(code) || prefixed.filter(c => code && code.startsWith(c)).length > 0;
};

const configI18n = ({ keyUiLocale }: { keyUiLocale: string }) => {
    i18n.changeLanguage(keyUiLocale);
    document.documentElement.setAttribute("dir", isLangRTL(keyUiLocale) ? "rtl" : "ltr");
};
