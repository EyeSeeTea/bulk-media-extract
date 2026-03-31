## Why

When writing template mappings, users cannot reference the current data element's name or code. This means templates are tightly coupled to specific data elements and cannot be reused across different ones. Adding `currentDataElement.name` and `currentDataElement.code` as available properties enables generic, reusable templates.

## What Changes

- Add a new "Current Data Element" property group to the available template properties, positioned after the "Event" section
- Introduce two new template tokens: `{currentDataElementName}` and `{currentDataElementCode}`
- Resolve these tokens at export time using the currently-processing file data element's metadata
- Update template validation regex to recognize the new tokens

## Capabilities

### New Capabilities

- `current-data-element-properties`: Expose the current data element's name and code as template properties available in the mapping editor and resolved during export

### Modified Capabilities

- `visual-template-builder`: Add the new "Current Data Element" property group to the template editor UI, displayed after the "Event" section
- `export-execution-configuration`: Resolve the new tokens during template resolution at export time

## Impact

- **Domain entities**: `ProgramFileProperty` gains new properties with sourceType for current data element context
- **Template resolution**: `TemplateBuilder.resolveTemplateForEvent()` must resolve `{currentDataElementName}` and `{currentDataElementCode}` from the `selectedFileProperty`
- **Template validation**: `TEMPLATE_TOKEN` regex in `wizardConfig.ts` must include the new tokens
- **Property building**: `ProgramD2Repository.buildProgramFileProperties()` or `TemplateBuilder.buildFileMetadataPropertyGroup()` must produce the new property group
- **UI**: `TemplateStep.tsx` must display the new group in the correct position (after Event)
