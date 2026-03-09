## Context

The preview step already computes file-level export rows and summary totals, but the rendered summary starts with org unit mode and the table still reflects broader event context columns. In `previewUtils.ts`, rows without a `fileResourceId` are currently filtered out entirely, which prevents the UI from warning users that some selected file data values will be skipped during export.

## Goals / Non-Goals

**Goals:**
- Reorder the preview summary so the selected program, selected file data elements with their templates, and org unit name appear before org unit mode.
- Render that summary in a denser horizontal layout rather than a tall stacked list.
- Reduce the preview table to the export review columns users asked for while making the event identifier actionable as a Capture app link.
- Preserve rows that are missing file-resource metadata so they can be rendered as warnings and counted in an aggregate skip message.
- Move preview totals and actions below the table so the file list stays visually primary.
- Keep preview statistics aligned with exportable files only, excluding rows that will be skipped.

**Non-Goals:**
- Changing wizard step order or step gating rules beyond existing duplicate-path validation.
- Changing export execution semantics beyond surfacing clearer warnings for rows that are already non-exportable.
- Introducing server-side preview processing or new DHIS2 endpoints.

## Decisions

### Keep missing-file-resource rows in the preview data model
`buildExportPreviewRows` should emit rows for every selected file data value in scope, even when the file resource metadata cannot be resolved. The row shape should carry both the raw file resource id and an explicit warning flag such as `isMissingFileResource`, and the warning should be driven by missing file metadata (`fileNames` / `fileSizes`) rather than only by absence of the raw data value.

Alternative considered: compute the warning count separately and keep omitting the rows. Rejected because the user asked for warning-highlighted rows in the listing, and splitting the count from the visible rows would make the UI harder to trust and test.

### Resolve org unit labels from multiple available sources
The selected org unit label in preview should come from the organisation-unit repository data when available, but it needs a second fallback path through preview event data so the UI does not regress to the raw id when the selected node is not present in the local org-unit list. Preview rows should also keep the event org unit id and label so Capture links and row context use the event's actual org unit.

Alternative considered: continue deriving the selected org unit label from `selectedProgram.organisationUnits`. Rejected because descendant selections fall back to ids and the link target can point at the wrong Capture context.

### Render summary and metrics in separate visual groups
The summary should use a compact grid that can place key-value blocks side by side. The table should remain the dominant element in the step, with warning notices, matching-event counts, statistics, and the export-configuration action placed below it.

Alternative considered: keep the stats and actions above the table. Rejected because it pushes the file list downward and weakens the preview’s primary review task.

### Render Capture links from event context with the current route shape
The `Event` column should render the event id as an external link to the Capture app, constructed from the DHIS2 base URL together with the event's org unit and event id, using the `#/enrollmentEventEdit?...` route shape requested by the current workflow. The link should receive explicit preview-table link styles so it reads as interactive even inside a dense data table.

Alternative considered: keep plain text event ids or continue using the selected org unit in link parameters. Rejected because the user needs reliable event navigation from the row itself, and the selected org unit can differ from the event org unit in descendant mode.

## Risks / Trade-offs

- [Capture link format can vary slightly across DHIS2 deployments] -> Mitigation: centralize URL construction in a small helper and cover it with UI tests using the current app base URL conventions.
- [Warning rows without resolved file-resource metadata may still contain a raw file value id] -> Mitigation: show neutral placeholders in display columns and use explicit warning text instead of surfacing the raw id as though it were a filename.
- [Preview summary now depends on more state sources] -> Mitigation: derive the selected org unit name from the organisation-unit hook first and fall back to preview event data before showing the raw id.
- [Stats may become misleading if skipped files are counted] -> Mitigation: define `Files` in the preview footer as exportable files only and keep skipped rows visible via the separate warning count.
