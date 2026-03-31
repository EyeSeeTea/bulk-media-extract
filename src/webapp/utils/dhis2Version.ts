import { D2Api } from "$/types/d2-api";

export type Dhis2Version = {
    major: number;
    minor: number;
    patch: number;
    raw: string;
};

export const DEFAULT_DHIS2_VERSION: Dhis2Version = {
    major: 2,
    minor: 41,
    patch: 0,
    raw: "2.41.0",
};

export function parseDhis2Version(rawVersion?: string | null): Dhis2Version {
    const match = rawVersion?.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
    if (!match) {
        return DEFAULT_DHIS2_VERSION;
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3] ?? 0),
        raw: rawVersion ?? DEFAULT_DHIS2_VERSION.raw,
    };
}

export function usesLegacyEventFileEndpoint(version: Dhis2Version): boolean {
    return version.major === 2 && version.minor <= 40;
}

export async function loadDhis2Version(api: D2Api): Promise<Dhis2Version> {
    try {
        const systemInfo = await api
            .get<{ version?: string }>("/system/info?fields=version")
            .getData();
        return parseDhis2Version(systemInfo.version);
    } catch {
        return DEFAULT_DHIS2_VERSION;
    }
}
