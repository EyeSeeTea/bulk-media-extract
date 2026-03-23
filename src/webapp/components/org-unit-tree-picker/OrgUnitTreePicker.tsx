import React from "react";
import { OrganisationUnitTree } from "@dhis2/ui";
import { NamedRef } from "$/domain/entities/Ref";

type Props = {
    programOrgUnits: NamedRef[];
    selected: string;
    onChange: (selection: { id: string; name?: string }) => void;
    disabled?: boolean;
};

type TreeOnChangePayload = {
    id: string;
    displayName: string;
    selected?: string[];
};

function buildScopeSignature(orgUnits: NamedRef[]): string {
    return orgUnits
        .map(orgUnit => `${orgUnit.id}:${orgUnit.path ?? ""}`)
        .sort()
        .join("|");
}

const arePropsEqual = (prev: Props, next: Props): boolean => {
    if (prev.selected !== next.selected) return false;
    if (prev.disabled !== next.disabled) return false;
    return buildScopeSignature(prev.programOrgUnits) === buildScopeSignature(next.programOrgUnits);
};

export const OrgUnitTreePicker: React.FC<Props> = React.memo(
    ({ programOrgUnits, selected, onChange, disabled = false }) => {
        const scopeSignature = React.useMemo(() => {
            return buildScopeSignature(programOrgUnits);
        }, [programOrgUnits]);

        const filterPaths = React.useMemo(() => {
            if (!scopeSignature) {
                return [];
            }

            return scopeSignature
                .split("|")
                .map(entry => entry.split(":")[1] ?? "")
                .filter((path): path is string => Boolean(path));
        }, [scopeSignature]);

        const rootIds = React.useMemo(() => {
            return Array.from(
                new Set(
                    filterPaths
                        .map(path => path.split("/").filter(Boolean)[0])
                        .filter((id): id is string => Boolean(id))
                )
            );
        }, [filterPaths]);

        const pathByOrgUnitId = React.useMemo(() => {
            const map = new Map<string, string>();
            for (const orgUnit of programOrgUnits) {
                if (!orgUnit.path) continue;
                const segments = orgUnit.path.split("/").filter(Boolean);
                for (let i = 0; i < segments.length; i++) {
                    const id = segments[i]!;
                    if (!map.has(id)) {
                        map.set(id, "/" + segments.slice(0, i + 1).join("/"));
                    }
                }
            }
            return map;
        }, [programOrgUnits]);

        const selectedPaths = React.useMemo(() => {
            if (!selected) return [];
            const path = pathByOrgUnitId.get(selected);
            return path ? [path] : [];
        }, [pathByOrgUnitId, selected]);

        const initiallyExpanded = React.useMemo(() => {
            return selectedPaths;
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [scopeSignature]);

        if (rootIds.length === 0 || filterPaths.length === 0) {
            return null;
        }

        return (
            <OrganisationUnitTree
                roots={rootIds}
                filter={filterPaths}
                selected={selectedPaths}
                initiallyExpanded={initiallyExpanded}
                singleSelection
                disableSelection={disabled}
                onChange={(payload: TreeOnChangePayload) => {
                    onChange({ id: payload.id, name: payload.displayName });
                }}
                dataTest="org-unit-tree-picker"
            />
        );
    },
    arePropsEqual
);
