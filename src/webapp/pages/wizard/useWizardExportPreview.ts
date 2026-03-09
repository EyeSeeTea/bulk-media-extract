import React from "react";
import { ProgramEventPreview, ProgramEventsPreviewResult } from "$/domain/entities/FileExportProgram";
import { useAppContext } from "$/webapp/contexts/app-context";
import { useCachedAsyncData } from "$/webapp/hooks/useCachedAsyncData";

type SelectedFileFilter = {
    fileDataElementId: string;
    programStageId?: string;
};

type Options = {
    enabled?: boolean;
    pageSize?: number;
};

export function useWizardExportPreview(
    programId: string,
    orgUnitId: string,
    orgUnitMode: "selected" | "descendants",
    selectedFileFilters: SelectedFileFilter[],
    options?: Options
) {
    const { compositionRoot } = useAppContext();
    const enabled = options?.enabled ?? true;
    const pageSize = options?.pageSize ?? 100;

    const filterSignature = selectedFileFilters
        .filter(filter => Boolean(filter.fileDataElementId))
        .map(filter => `${filter.programStageId ?? ""}:${filter.fileDataElementId}`)
        .sort()
        .join("|");

    const normalizedFilters = React.useMemo(() => {
        if (!filterSignature) {
            return [];
        }

        return filterSignature.split("|").map(filterValue => {
            const [programStageId, fileDataElementId] = filterValue.split(":");
            return {
                programStageId: programStageId || undefined,
                fileDataElementId,
            };
        });
    }, [filterSignature]);

    const cacheKey =
        programId && orgUnitId && normalizedFilters.length > 0
            ? [
                  programId,
                  orgUnitId,
                  orgUnitMode,
                  String(pageSize),
                  filterSignature,
              ].join("|")
            : undefined;

    const asyncFunction = React.useCallback(async (): Promise<ProgramEventsPreviewResult> => {
        const previews = await Promise.all(
            normalizedFilters.map(filter =>
                compositionRoot.programs.getEventsPreview
                    .execute(
                        programId,
                        orgUnitId,
                        orgUnitMode,
                        filter.programStageId,
                        filter.fileDataElementId,
                        pageSize,
                        true
                    )
                    .toPromise()
            )
        );

        const eventById = new Map<string, ProgramEventsPreviewResult["events"][number]>();
        previews.forEach(preview => {
            preview.events.forEach(event => {
                const existing = eventById.get(event.id);
                if (!existing) {
                    eventById.set(event.id, event);
                    return;
                }

                eventById.set(
                    event.id,
                    ProgramEventPreview.create({
                        ...existing._getAttributes(),
                        orgUnitAttributeValues: {
                            ...existing.orgUnitAttributeValues,
                            ...event.orgUnitAttributeValues,
                        },
                        dataValues: { ...existing.dataValues, ...event.dataValues },
                        attributeValues: {
                            ...existing.attributeValues,
                            ...event.attributeValues,
                        },
                        fileValues: { ...existing.fileValues, ...event.fileValues },
                        fileNames: { ...existing.fileNames, ...event.fileNames },
                        fileSizes: { ...existing.fileSizes, ...event.fileSizes },
                    })
                );
            });
        });

        return ProgramEventsPreviewResult.create({
            events: Array.from(eventById.values()),
            total: eventById.size,
            pageCount: eventById.size === 0 ? 0 : 1,
        });
    }, [
        compositionRoot.programs.getEventsPreview,
        normalizedFilters,
        orgUnitId,
        orgUnitMode,
        pageSize,
        programId,
    ]);

    const { state, execute } = useCachedAsyncData(cacheKey, asyncFunction, {
        enabled: Boolean(programId && orgUnitId && normalizedFilters.length > 0 && enabled),
    });

    return {
        state,
        reload: execute,
    };
}
