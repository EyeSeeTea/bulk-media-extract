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

### Requirement: OrgUnitTreePicker keeps tree configuration stable across rerenders
The system MUST preserve stable tree-query inputs for `OrganisationUnitTree` while the allowed organisation unit scope is unchanged, so rerenders from selection updates or parent updates do not trigger the DHIS2 static-query warning.

#### Scenario: Selection changes do not recreate tree query configuration
- **WHEN** the user changes the selected organisation unit without changing the allowed org unit scope
- **THEN** the picker updates the selection while keeping the wrapped DHIS2 tree configuration stable enough to avoid the static-query warning

