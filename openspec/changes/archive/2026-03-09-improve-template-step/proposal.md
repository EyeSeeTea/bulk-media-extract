## Why

The template step currently exposes the right core workflow, but the property catalog, layout, and step affordances make it harder than necessary to build templates quickly and confidently. The org unit picker also emits a DHIS2 UI warning caused by recreating query input during render, which should be corrected before the template step is expanded further.

## What Changes

- Reorganize the template property catalog so file metadata appears first, includes a file extension token, and better matches how users compose filenames.
- Split organisation unit placeholders into their own section and expand that section with additional organisation unit metadata, including custom org unit attributes when available.
- Narrow the existing metadata section to event-specific placeholders, renaming it if needed and adding any additional useful event/enrollment fields that can be resolved consistently.
- Adjust the template editor layout so the token usage hint moves below the textarea and is styled as secondary helper text rather than primary body copy.
- Improve `wizard-section` styling and strengthen the selected-state styling for wizard step tabs so the active step is unmistakable.
- Fix `OrgUnitTreePicker` so it does not recreate the DHIS2 tree query configuration within the render loop and no longer triggers the static-query warning.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `visual-template-builder`: Reorder and expand the template property catalog, add file extension support, and refine the template editor help-text layout.
- `program-file-property-inspection`: Expose organisation unit placeholders as a dedicated section with richer org unit metadata and available custom attributes, while narrowing shared metadata to event-specific values.
- `file-export-wizard`: Improve the visual hierarchy of template-step sections and make the active wizard step tab clearly distinguishable.
- `org-unit-tree-picker`: Preserve the current single-select org unit picker behavior without triggering runtime warnings from dynamic tree query creation.

## Impact

Affected code will include the wizard page and styles, template token resolution and validation, program property inspection/repository mapping, and the reusable org unit tree picker component and its tests. No external API contract changes are expected, but the normalized placeholder set and grouping rules exposed by the UI will expand.
