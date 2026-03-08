## Why

The current org unit selector in `EventPreview` is a plain HTML `<select>` that lists all accessible org units as a flat list. DHIS2 org unit hierarchies can be very large, making flat selection impractical and inconsistent with the rest of the DHIS2 UI. The `OrganisationUnitTree` component from `@dhis2/ui` provides a native, hierarchical picker that users expect across DHIS2 apps. Additionally, the list is not currently filtered to the org units that actually have data for the selected program, which can lead to empty preview results.

## What Changes

- Replace the custom `<select>` in `EventPreview` with the `OrganisationUnitTree` component from `@dhis2/ui`
- Wrap the org unit tree picker in a dedicated `OrgUnitTreePicker` component
- Filter the available org units to only those associated with the selected program (program's `organisationUnits` metadata)
- Update the `EventPreview` props to accept the program's org unit list (already available from `GetFileCapableProgramsUseCase`)

## Capabilities

### New Capabilities

- `org-unit-tree-picker`: A reusable `OrgUnitTreePicker` component wrapping `@dhis2/ui`'s `OrganisationUnitTree`, receiving a constrained list of selectable org units and emitting single-selection events.

### Modified Capabilities

- `org-unit-event-preview`: Org unit selection is now constrained to org units registered for the selected program, and the UI uses a hierarchical tree instead of a flat select.

## Impact

- `src/webapp/pages/landing/components/EventPreview.tsx` — replaces `<select>` with `OrgUnitTreePicker`
- New component: `src/webapp/components/org-unit-tree-picker/OrgUnitTreePicker.tsx`
- `src/webapp/pages/landing/` parent component — may need to pass program org units down to `EventPreview`
- No domain/repository changes required; org unit data already available from `FileExportProgram`
- New peer dependency usage: `@dhis2/ui` `OrganisationUnitTree` (already installed)
