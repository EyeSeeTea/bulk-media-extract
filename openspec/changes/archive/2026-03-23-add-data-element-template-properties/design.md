## Context

The template mapping system allows users to compose file export paths using placeholder tokens like `{orgUnitName}`, `{enrollmentDate}`, and `{dataElement:id}`. Properties are organized into groups (File metadata, Organisation unit, Event, Data elements) and displayed in the visual template builder.

Currently, there is no way to reference the name or code of the data element being exported. The `selectedFileProperty` (the current file data element) is already passed through the resolution pipeline but only exposes file-level metadata (`fileDataElementId`, `fileDataElementName`, etc.) under the "File metadata" group. Users want to use the data element's name or code directly in template paths so that a single template can produce different paths per data element.

## Goals / Non-Goals

**Goals:**
- Expose `currentDataElementName` and `currentDataElementCode` as template tokens
- Display them in a new "Current Data Element" property group positioned after the "Event" section in the template builder
- Resolve these tokens at export time from the `selectedFileProperty` already available in the resolution context

**Non-Goals:**
- Changing the existing "File metadata" group or its tokens (e.g., `fileDataElementName` remains as-is)
- Adding other data element attributes (description, formName, etc.) — can be added later if needed
- Changing how per-file mapping overrides work

## Decisions

### 1. Reuse `metadata` sourceType rather than introducing a new one

The new properties will use `sourceType: "metadata"` like the existing file metadata properties. The `selectedFileProperty` already carries `name` and we need to ensure `code` is available.

**Alternative considered**: A new `"currentDataElement"` sourceType. Rejected because it would require changes to `FilePropertySourceType`, `getPropertyTemplateToken()`, and downstream logic for minimal benefit — the tokens are simple string IDs resolved the same way as other metadata tokens.

### 2. Add a separate property group displayed after Event

Rather than adding to the existing "File metadata" group, create a distinct "Current Data Element" group. This keeps the semantic separation clear: file metadata describes the file resource, while current data element describes the DHIS2 data element definition.

**Alternative considered**: Adding to "File metadata" group. Rejected because the user explicitly wants these after the Event section, and they are conceptually different from file resource metadata.

### 3. Token names: `currentDataElementName` and `currentDataElementCode`

Prefix with `currentDataElement` to avoid confusion with `fileDataElementName` (which already exists) and to clearly indicate these refer to the data element definition, not the file resource.

### 4. Source the `code` from `ProgramFileProperty`

Currently `ProgramFileProperty` doesn't have a `code` field. We'll add an optional `code` attribute to `ProgramFilePropertyAttrs`. This is populated when building properties from the DHIS2 program metadata (data elements already have `code` in the API response).

## Risks / Trade-offs

- **[Risk] `code` may be empty for some data elements** → The token resolves to empty string when code is not set, consistent with how other optional properties behave. The property will only be shown in the catalog when at least one selected file data element has a code.
- **[Risk] Existing templates are unaffected** → New tokens are additive; the regex and resolution changes are backward-compatible.
