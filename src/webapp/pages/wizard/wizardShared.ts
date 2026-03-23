import { ProgramEventPreview } from "$/domain/entities/ProgramEventPreview";
import { ProgramFileProperties } from "$/domain/entities/ProgramFileProperties";
import { ProgramFileProperty } from "$/domain/entities/ProgramFileProperty";
import { ProgramFilePropertyGroup } from "$/domain/entities/ProgramFilePropertyGroup";
import { buildFileMetadataPropertyGroup, buildCurrentDataElementPropertyGroup } from "$/application/export/TemplateBuilder";

export type ProgramOption = {
    id: string;
    name: string;
    organisationUnits: Array<{ id: string; name: string; path?: string }>;
};

export const FILE_VALUE_TYPES = new Set(["FILE_RESOURCE", "IMAGE"]);

export function filterEventsByDate(
    events: ProgramEventPreview[],
    dateFrom: string,
    dateTo: string
): ProgramEventPreview[] {
    const from = dateFrom ? new Date(dateFrom).getTime() : undefined;
    const to = dateTo ? new Date(dateTo).getTime() : undefined;

    return events.filter(event => {
        if (from === undefined && to === undefined) {
            return true;
        }

        if (!event.eventDate) {
            return false;
        }

        const timestamp = new Date(event.eventDate).getTime();
        if (from !== undefined && timestamp < from) {
            return false;
        }
        if (to !== undefined && timestamp > to) {
            return false;
        }
        return true;
    });
}

export function getVisiblePropertyGroupsForFile(
    propertyGroups: ProgramFileProperties["propertyGroups"],
    selectedFileProperties: ProgramFileProperty[],
    currentFileProperty: ProgramFileProperty
) {
    const fileMetadataGroup = buildFileMetadataPropertyGroup(selectedFileProperties);
    const currentDataElementGroup = buildCurrentDataElementPropertyGroup(selectedFileProperties);
    const currentStageId = currentFileProperty.sourceContainerId;
    const scopedGroups = propertyGroups
        .map(group => {
            if (group.sourceType !== "dataElement") {
                return group;
            }

            const properties = group.properties.filter(property => {
                if (!currentStageId) {
                    return true;
                }
                return property.sourceContainerId === currentStageId;
            });

            return ProgramFilePropertyGroup.create({
                id: group.id,
                name: group.name,
                sourceType: group.sourceType,
                properties,
            });
        })
        .filter(group => group.properties.length > 0);

    const eventGroupIndex = scopedGroups.findIndex(group => group.sourceType === "event");
    const insertIndex = eventGroupIndex >= 0 ? eventGroupIndex + 1 : scopedGroups.length;

    const orderedGroups = currentDataElementGroup
        ? [...scopedGroups.slice(0, insertIndex), currentDataElementGroup, ...scopedGroups.slice(insertIndex)]
        : scopedGroups;

    return fileMetadataGroup ? [fileMetadataGroup, ...orderedGroups] : orderedGroups;
}
