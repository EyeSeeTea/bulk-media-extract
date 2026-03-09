## Why

Today users can proceed without defining a specific mapping for every file dataValue, which makes exports ambiguous and error-prone. We need to enforce explicit per-file mapping so exported files always use an intentional template and users can trust the result before execution.

## What Changes

- Update wizard step 1 to require selecting at least one file dataValue to sync before advancing.
- Update wizard step 2 to require selecting one mapping per file selected in step 1 before advancing.
- Expand step 2 available properties with file-related placeholders (including filename and additional DHIS2-provided file metadata).
- Add validation messages and step gating to prevent progression when these requirements are not met.

## Capabilities

### New Capabilities
- `file-mapping-per-selected-file`: enforce explicit one-to-one mapping between selected file dataValues and mapping definitions.

### Modified Capabilities
- `file-export-wizard`: step-level validation and progression rules change for step 1 and step 2.
- `visual-template-builder`: available property catalog expands with file metadata placeholders for mapping authoring.

## Impact

- Affected webapp wizard flow and validation logic in file selection and mapping steps.
- Affected template builder/property catalog data preparation and rendering.
- Affected export configuration model passed to execution (now guarantees explicit per-file mappings).
