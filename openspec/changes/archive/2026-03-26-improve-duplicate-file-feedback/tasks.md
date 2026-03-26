## 1. Enrich ExportPreviewSummary type

- [x] 1.1 Add `DuplicateTargetPathDetail` type and `duplicateTargetPathDetails` field to `ExportPreviewSummary` in `ExportPreview.ts`

## 2. Build structured conflict details in PreviewBuilder

- [x] 2.1 Update `summarizeExportPreview` in `PreviewBuilder.ts` to populate `duplicateTargetPathDetails` by grouping duplicate rows by path with their eventId and fileDataValueName
- [x] 2.2 Investigate and fix the highlighting bug — verify that `buildExportPreviewRows` marks all rows sharing a duplicate path (check memoization and CSS specificity with `wizard-preview-row-warning`)

## 3. Update PreviewStep UI

- [x] 3.1 Update the `previewSummary` prop type in `PreviewStep.tsx` to include `duplicateTargetPathDetails`
- [x] 3.2 Replace the generic count message in the duplicate `NoticeBox` with a list of conflicting paths and their source event IDs and file data element names
- [x] 3.3 Add a cap (e.g. 10 paths) with "and N more" overflow text for long conflict lists

## 4. Tests

- [x] 4.1 Add/update test in `previewUtils.spec.ts` for `summarizeExportPreview` verifying `duplicateTargetPathDetails` contains path, eventId, and fileDataValueName for each conflict
- [x] 4.2 Add test verifying that all rows in a duplicate pair have `hasDuplicateTargetPath: true` (strengthen existing test coverage)
