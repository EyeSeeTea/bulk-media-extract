## Why

When duplicate target filepaths are detected in the preview step (step 3), the feedback is insufficient: only one of the conflicting rows is visually highlighted, and the warning notice only shows a count without listing which paths conflict or which events/data elements produce them. This makes it hard for users to diagnose and fix template conflicts.

## What Changes

- Fix row highlighting so that **all** rows sharing a duplicate target path are highlighted, not just one.
- Enhance the "Duplicate target filepaths detected" NoticeBox to include:
  - A list of the conflicting target paths.
  - For each conflicting path, which events and file data elements produce it.
- Enrich `ExportPreviewSummary` to carry per-path conflict details (conflicting rows metadata) so the UI can render them.

## Capabilities

### New Capabilities

### Modified Capabilities

- `file-export-wizard`: The preview step's duplicate path feedback is improved with better highlighting and richer conflict details in the warning notice.

## Impact

- `src/application/export/ExportPreview.ts` — `ExportPreviewSummary` type gains structured conflict details.
- `src/application/export/PreviewBuilder.ts` — `summarizeExportPreview` builds per-path conflict info; possible fix to duplicate-marking logic.
- `src/webapp/pages/wizard/steps/PreviewStep.tsx` — NoticeBox renders conflict list with paths, event IDs, and data element names.
- `src/webapp/pages/wizard/previewUtils.spec.ts` — Updated/new tests for enriched summary and highlighting fix.
