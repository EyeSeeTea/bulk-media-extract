Design: Fix preview behavior for multiple file data elements

Overview

When multiple file data elements are selected, the template preview makes a single API call without any dataElement filter. DHIS2 returns the first N events for the program, which may not contain file values for any of the selected data elements — resulting in empty previews.

Root cause

The single `useProgramEventsPreview` call passes `undefined` for both `programStageId` and `fileDataElementId` when multiple elements are selected. Without the `filter` parameter (`dataElementId:gt:1`), the DHIS2 tracker API returns events regardless of whether they have file values.

Existing solution pattern

`useWizardExportPreview` already solves this problem for the full export preview: it makes one API call per data element (each with the proper `programStageId` + `fileDataElementId` filter), then merges deduplicated results. This is the correct pattern.

Fix

Replace the single `useProgramEventsPreview` call in `useWizardTemplatePreviewData` with `useWizardExportPreview`. This reuses the proven per-element fetch+merge pattern for the template preview as well.

Detailed change

File: src/webapp/pages/wizard/hooks/useWizardTemplatePreviewData.ts

1. Replace `useProgramEventsPreview` import with `useWizardExportPreview`
2. Build `selectedFileFilters` from `selectedFileDataElements`
3. Call `useWizardExportPreview` instead of `useProgramEventsPreview`
4. Remove the now-unnecessary `previewProgramStageId` / `previewFileDataElementId` variables
5. Keep the existing `quickPreviewByFileKey` per-element filtering + `.slice(0, 10)`

Why this approach

- Reuses an existing, proven hook — no new data-fetching logic needed
- Each data element gets its own filtered API call, ensuring events with files are returned
- Merged results are deduplicated by event ID
- Minimal change to the template preview hook
