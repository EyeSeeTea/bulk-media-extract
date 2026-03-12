import { ProgramEventPreview } from "$/domain/entities/ProgramEventPreview";
import { Struct } from "$/domain/entities/generic/Struct";

export type ProgramEventsPreviewResultAttrs = {
    events: ProgramEventPreview[];
    total?: number;
    pageCount?: number;
};

export class ProgramEventsPreviewResult extends Struct<ProgramEventsPreviewResultAttrs>() {}
