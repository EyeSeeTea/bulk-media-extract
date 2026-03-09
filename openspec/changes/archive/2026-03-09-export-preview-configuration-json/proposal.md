## Why

The preview step already shows the concrete files and resolved target paths that would be exported, but the current "Export configuration" action is only a placeholder. A real configuration artifact is needed now so the reviewed preview can become a deterministic execution input for later export and import workflows without forcing users to recompute the file list.

## What Changes

- Introduce an export execution configuration JSON contract that captures the reviewed preview output in a portable format.
- Generate that configuration from the preview step using only exportable preview rows, excluding rows whose selected file data value is missing a resolved `FileResource`.
- Keep `source` and `target` in each operation, but reduce the `source` payload to only the DHIS2 tracker file URL, `fileResourceId`, and `fileSize`.
- Replace the preview-step placeholder action with a real JSON download when the user clicks `Export configuration`.

## Capabilities

### New Capabilities
- `export-execution-configuration`: Defines the JSON structure used to persist a reviewed file-export plan for later execution against a storage target.

### Modified Capabilities
- `file-export-wizard`: Change the preview-step export configuration action from a placeholder into a JSON download backed by the reviewed preview result.

## Impact

- Affected code: preview-step state shaping, JSON serialization/download handling, and shared types across `src/webapp/pages/wizard/`.
- Affected domain/data flow: preview rows must expose enough stable source and destination data to build an execution-ready configuration artifact.
- APIs/systems: reuses existing DHIS2 file/dataValue URLs and metadata already fetched for preview; no storage upload or configuration import is implemented in this change.
