## Why

The preview step now surfaces the export set earlier, but the information hierarchy is still hard to scan and mixes setup context with file results. Users also need an explicit warning when some previewed file data values cannot be exported because their `FileResource` is missing.

## What Changes

- Reorder the preview summary so it shows the selected program, each selected file data element with its template, and the org unit name before the org unit mode details.
- Make the preview summary more compact and use horizontal layout space more effectively.
- Narrow the preview results table to the export review columns only: event link, file data value, source filename, size, and resolved target path.
- Move the matching-events text, file statistics, and export-configuration action below the preview table.
- Resolve the selected org unit label to its display name instead of falling back to the raw id.
- Build Capture links with the event's org unit using the current Capture enrollment-event route format, and render those links with clear link styling.
- Improve the preview table visual styling for scanability.
- Make the preview table use the available width.
- Highlight preview rows whose file data value is missing a `FileResource` as warnings.
- Add an aggregate warning message stating how many files without `FileResource` will be skipped during export.
- Count only exportable files in the preview file totals.

## Capabilities

### New Capabilities

### Modified Capabilities

- `org-unit-event-preview`: refine preview summary ordering, result columns, and warning behavior for rows missing `FileResource`

## Impact

- Affected code: preview-step summary rendering, org unit name resolution and fallback logic, preview table column definitions and layout, Capture link generation, row-state styling, and warning messaging in `src/webapp/`.
- Affected behavior: preview remains a pre-export validation step but now distinguishes exportable rows from skipped rows caused by missing file resources.
- APIs/systems: reuses existing DHIS2 event and file metadata already loaded for preview; no new external integrations are introduced.
