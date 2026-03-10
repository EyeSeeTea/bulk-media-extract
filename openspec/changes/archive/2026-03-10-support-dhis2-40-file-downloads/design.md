## Context

The current preview/export pipeline builds source file URLs in `previewUtils.ts` and reuses those URLs in both the preview-derived execution configuration and the execution runner. That keeps the data flow simple, but it also means the hardcoded `api/41/tracker/events/{event}/dataValues/{dataElement}/file` path breaks every downstream step when the connected DHIS2 instance is 2.40, where file downloads still use `api/40/events/files?dataElementUid=...&eventUid=...`.

This change crosses app bootstrap, preview data preparation, preview rendering, and execution flow. It needs a design so the app learns the upstream DHIS2 version once, then reuses a single version-aware file URL strategy everywhere the export plan references a source file.

## Goals / Non-Goals

**Goals:**
- Detect the connected DHIS2 version from the upstream server and expose it to the web app.
- Centralize file download URL generation so preview rows, exported execution configuration, and execution-time downloads use the same logic.
- Support at least the known route split between DHIS2 2.40 and 2.41+.
- Add a direct original-file link in preview without changing the existing preview-table column structure.

**Non-Goals:**
- Broad compatibility work for unsupported DHIS2 versions outside the known 2.40 vs 2.41+ split.
- Reworking the preview table into a different layout or adding a dedicated new column for source links.
- Changing how file resources are discovered from tracker events.

## Decisions

### Detect DHIS2 version during app bootstrap and store it in shared app context
The app should fetch the DHIS2 version once during bootstrap, alongside the existing base URL and composition root setup, then expose the parsed version through the shared app context used by the wizard. This keeps version lookup out of row builders and avoids repeated network calls during preview or execution.

Alternative considered: infer the version from failing download requests and retry with a legacy URL. Rejected because it adds avoidable failed requests to every incompatible export and makes preview/open-link behavior inconsistent.

### Use one centralized file URL builder with explicit 2.40 vs 2.41+ branches
The existing preview utility that builds `fileDataValueUrl` should become the single source of truth for event-file URLs. It should accept base URL plus detected server version and branch to:
- `api/40/events/files?dataElementUid=...&eventUid=...` for DHIS2 2.40
- `api/41/tracker/events/{eventId}/dataValues/{dataElementId}/file` for DHIS2 2.41 and later

The execution configuration should continue serializing the URL already computed for each preview row rather than rebuilding it elsewhere.

Alternative considered: add separate URL builders for preview and execution. Rejected because the current bug exists precisely because URL knowledge is duplicated in an unstable way across features and tests.

### Render the original-file link inside the existing source-filename cell
The preview spec already fixes the visible columns to `Event`, `File data value`, `source filename`, `size`, and `target`. To avoid widening scope, the original-file action should appear inside the `source filename` cell for rows that have an exportable source file. Missing-file-resource warning rows should keep their warning treatment and not render a broken link.

Alternative considered: add a new `Original file` column. Rejected because it would require a broader preview-table spec change for a problem that can be solved within the existing cell.

## Risks / Trade-offs

- [Server-version discovery endpoint may fail or be unavailable in some environments] -> Mitigation: keep the version fetch isolated at bootstrap, surface a clear fallback, and default to the existing 2.41+ route only when version metadata cannot be obtained.
- [Older or future DHIS2 releases may not match the simple 2.40 vs 2.41+ split] -> Mitigation: centralize the mapping in one helper so future route additions do not require touching preview, config export, and execution separately.
- [Preview rows now carry one more user-visible action] -> Mitigation: place the link as secondary text/action within the source filename cell so table density stays close to the current layout.
- [Tests that assert literal `api/41` URLs will fail broadly] -> Mitigation: update tests to assert version-dependent URL outputs through shared fixtures rather than repeating hardcoded literals in each suite.
