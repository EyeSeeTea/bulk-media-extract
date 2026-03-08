## Why

Building URL/path templates with free-text placeholders is error-prone and slow because users must remember variable names and program structure. A visual builder is needed now so implementers can compose valid templates faster and immediately verify output before running exports.

## What Changes

- Add a visual template builder UI that shows the editable template input and an interactive property browser side by side.
- Organize available properties by program type:
- For tracker programs: tracked entity attributes/data elements, grouped program stage data elements, and core metadata placeholders.
- For event programs: all event data elements and core metadata placeholders.
- Insert placeholders at the current cursor position in the template when users click a property.
- Add real-time template validation and show parsing errors inline.
- Add a quick preview section below the builder that renders resolved output for the first 10 events when the template is valid.

## Capabilities

### New Capabilities
- `visual-template-builder`: Interactive UI for constructing path/filename templates from program properties with cursor-based insertion and inline preview.

### Modified Capabilities
- `program-file-property-inspection`: Expand and normalize available placeholder metadata by program type so the builder can render complete grouped property lists.
- `org-unit-event-preview`: Support resolving a user-defined template and returning first-10-item preview rows for valid templates.
- `file-export-wizard`: Integrate the visual builder step into the existing export configuration flow while preserving current export behavior.

## Impact

- Affected UI: file export wizard/template input screen and related React components.
- Affected domain/data flow: property discovery use cases/repositories and preview data retrieval.
- API usage: additional reads for program metadata and preview events; no new backend endpoints.
- Testing: add unit tests for template insertion/validation and integration tests for preview rendering across tracker and event programs.
