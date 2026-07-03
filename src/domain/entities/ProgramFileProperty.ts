import { Id } from "$/domain/entities/Ref";
import { Struct } from "$/domain/entities/generic/Struct";

export type FilePropertySourceType =
    | "dataElement"
    | "trackedEntityAttribute"
    | "metadata"
    | "organisationUnit"
    | "organisationUnitAttribute"
    | "event";

export type ProgramFilePropertyAttrs = {
    id: Id;
    name: string;
    valueType: string;
    sourceType: FilePropertySourceType;
    sourceContainerId?: Id;
    sourceContainerName?: string;
    code?: string;
};

export class ProgramFileProperty extends Struct<ProgramFilePropertyAttrs>() {
    /**
     * Stable identity for selection and template mapping. The same data element can be attached to
     * several program stages, so `id` alone is not unique. Scoping by the source container (program
     * stage) keeps each stage-specific file field independent. `id` remains the raw DHIS2 id used
     * for API queries and template tokens.
     */
    get key(): string {
        return this.sourceContainerId ? `${this.sourceContainerId}:${this.id}` : this.id;
    }
}
