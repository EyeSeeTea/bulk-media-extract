## Why

Users need a reliable starting point to export files from DHIS2 programs, but currently they must already know which programs contain file-type values and where those values live. A guided program picker that only shows file-capable programs reduces setup errors and accelerates export configuration.

## What Changes

- Add a Program picker that lists only DHIS2 programs that contain at least one file-type value source.
- Detect file-type value sources across tracker metadata, including event data elements, tracked entity attributes, and other program-linked file fields supported by the API.
- Show program details after selection, including program type and all discovered file-capable properties.
- Add an org unit selector that enables event preview for the selected program.
- Show a preview sample of events for the selected org unit, including file-related values and core event context needed for validation.

## Capabilities

### New Capabilities
- `file-capable-program-discovery`: Discover and list programs that have at least one file-type data source.
- `program-file-property-inspection`: Inspect a selected program and present program type plus all available file-related properties.
- `org-unit-event-preview`: Retrieve and display sample events for a selected org unit in the context of the selected program.

### Modified Capabilities
- None.

## Impact

- Affected code:
  - Program/stage selection and filtering UI in `src/webapp/`.
  - DHIS2 metadata retrieval and mapping in `src/data/repositories/`.
  - New domain use cases for discovery, inspection, and preview in `src/domain/usecases/`.
- APIs:
  - DHIS2 metadata endpoints for programs, program stages, data elements, tracked entity attributes, and value types.
  - DHIS2 event/tracker endpoints for org unit scoped preview.
- Dependencies/systems:
  - No new external storage dependency changes.
  - Existing `@eyeseetea/d2-api` usage will be extended for additional metadata traversal and preview queries.
