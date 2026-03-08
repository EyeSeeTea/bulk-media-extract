## ADDED Requirements

### Requirement: OrgUnitTreePicker wraps DHIS2 tree component
The system SHALL provide a reusable `OrgUnitTreePicker` component that wraps `OrganisationUnitTree` from `@dhis2/ui`, accepting a restricted list of selectable org units and emitting single-selection events.

#### Scenario: Picker renders with allowed roots
- **WHEN** a non-empty list of program org units is provided
- **THEN** the tree displays only those org units as root nodes

#### Scenario: Picker emits selected org unit id
- **WHEN** the user clicks an org unit in the tree
- **THEN** `onChange` is called with that org unit's id

#### Scenario: Picker is disabled when no program is selected
- **WHEN** `disabled` prop is true
- **THEN** the tree interaction is disabled

## MODIFIED Requirements

### Requirement: Event preview requires program and org unit context
The system SHALL enable org unit selection only for org units that are registered against the currently selected program. Selection uses the `OrganisationUnitTree` component from `@dhis2/ui` instead of a flat select element.

#### Scenario: Preview blocked until required selections exist
- **WHEN** either program or organisation unit is missing
- **THEN** the preview area remains disabled and explains required selections

#### Scenario: Org unit tree shows only program org units
- **WHEN** a program is selected
- **THEN** the org unit picker renders `OrganisationUnitTree` with only the program's registered org units as selectable roots

#### Scenario: Selecting an org unit from the tree triggers preview
- **WHEN** the user selects an org unit from the tree
- **THEN** `onSelectOrgUnit` is called with the selected org unit id and event preview is triggered
