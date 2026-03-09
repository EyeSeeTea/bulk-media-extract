## Why

Users currently configure storage before seeing the concrete export output, which makes template mistakes harder to detect and correct. A dedicated preview step is needed earlier in the wizard so users can validate computed target paths, spot duplicate destinations, and understand export volume before touching storage settings.

## What Changes

- Reorder the wizard so the preview step appears before the storage step.
- Expand the preview step to list every file selected for export together with its computed destination path from the configured template.
- Detect duplicate computed target file paths in the preview and block progression until the template is corrected.
- Show aggregate preview statistics including total file count and total file size.
- Add an export-configuration action button in the preview step UI as a placeholder for future config file generation, without implementing the file generation yet.

## Capabilities

### New Capabilities

### Modified Capabilities
- `file-export-wizard`: Change wizard step order, gate progression on preview validation, and expose the preview-level export configuration action.
- `org-unit-event-preview`: Expand preview output from sample events to full file export preview rows with resolved target paths, duplicate detection inputs, and aggregate file statistics.

## Impact

- Affected code: wizard step composition, preview-step UI/state, and preview data preparation across `src/webapp/`.
- Affected domain/data flow: preview queries and template resolution must support all selected files, aggregate size computation, and duplicate path validation before storage configuration.
- APIs/systems: reuses existing DHIS2 metadata and file information retrieval; no new external service or config export endpoint is introduced in this change.
