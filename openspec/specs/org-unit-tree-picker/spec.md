# org-unit-tree-picker Specification

## Purpose
Define a reusable org unit tree picker component for selecting a single organisation unit within constrained program scope.

## Requirements
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
