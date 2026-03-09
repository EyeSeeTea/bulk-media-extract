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

export const OrgUnitTreePicker: React.FC<Props> = React.memo(
    ({ programOrgUnits, selected, onChange, disabled = false }) => {
        const [selectedPaths, setSelectedPaths] = React.useState<string[]>([]);
        const filterPaths = React.useMemo(
            () =>
                programOrgUnits
                    .map(orgUnit => orgUnit.path)
                    .filter((path): path is string => Boolean(path)),
            [programOrgUnits]
        );

        const rootIds = React.useMemo(() => {
            return Array.from(
                new Set(
                    filterPaths
                        .map(path => path.split("/").filter(Boolean)[0])
                        .filter((id): id is string => Boolean(id))
                )
            );
        }, [filterPaths]);

        React.useEffect(() => {
            if (!selected) {
                setSelectedPaths([]);
                return;
            }

            const selectedPath = programOrgUnits.find(orgUnit => orgUnit.id === selected)?.path;
            if (selectedPath) {
                setSelectedPaths([selectedPath]);
            }
        }, [programOrgUnits, selected]);

        if (rootIds.length === 0 || filterPaths.length === 0) {
            return null;
        }

        return (
            <OrganisationUnitTree
                roots={rootIds}
                filter={filterPaths}
                selected={selectedPaths}
                singleSelection
                disableSelection={disabled}
                onChange={(payload: TreeOnChangePayload) => {
                    setSelectedPaths(payload.selected ?? []);
                    onChange({ id: payload.id, name: payload.displayName });
                }}
                dataTest="org-unit-tree-picker"
            />
        );
    }
);
