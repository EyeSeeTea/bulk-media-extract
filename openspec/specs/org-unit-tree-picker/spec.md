# org-unit-tree-picker Specification

## Purpose
Define a reusable org unit tree picker component for selecting a single organisation unit within constrained program scope.
## Requirements
### Requirement: OrgUnitTreePicker wraps DHIS2 tree component
The system SHALL provide a reusable `OrgUnitTreePicker` component that wraps `OrganisationUnitTree` from `@dhis2/ui`, accepting a restricted list of selectable org units and emitting single-selection events. The component SHALL derive its visual selection state entirely from the `selected` prop, without maintaining independent internal selection state. The component SHALL resolve paths for all nodes in the org unit hierarchy (root, intermediate, and leaf), not only the org units directly listed in `programOrgUnits`.

#### Scenario: Picker renders with allowed roots
- **WHEN** a non-empty list of program org units is provided
- **THEN** the tree displays the hierarchy rooted at the common ancestor of those org units

#### Scenario: Picker emits selected org unit id
- **WHEN** the user clicks any visible org unit in the tree (root, intermediate, or leaf)
- **THEN** `onChange` is called with that org unit's id

#### Scenario: Picker is disabled when no program is selected
- **WHEN** `disabled` prop is true
- **THEN** the tree interaction is disabled

#### Scenario: Default selection is visually highlighted on initial render
- **WHEN** the `selected` prop contains a valid org unit id on mount
- **THEN** the tree SHALL auto-expand parent nodes and visually highlight the corresponding node without requiring user interaction

#### Scenario: Single click updates selection immediately for any hierarchy level
- **WHEN** the user clicks any visible org unit in the tree (root, intermediate, or leaf)
- **THEN** the selection highlight SHALL update to the clicked node after a single click, without requiring a second click

#### Scenario: Clicking root or intermediate nodes resolves to a valid selection
- **WHEN** the user clicks a root or intermediate org unit that is not directly in `programOrgUnits`
- **THEN** the component SHALL resolve the node's path from the hierarchy and emit a valid selection

### Requirement: OrgUnitTreePicker keeps tree configuration stable across rerenders
The system MUST use a custom `React.memo` comparator that compares `programOrgUnits` by content and ignores unstable callback references, so that rerenders from parent state changes that do not affect the org unit scope do not propagate to the DHIS2 tree.

#### Scenario: Unstable onChange reference does not trigger re-render
- **WHEN** the parent re-renders with a new `onChange` function reference but unchanged org unit scope and selection
- **THEN** the picker SHALL not re-render

#### Scenario: Selection changes do not recreate tree query configuration
- **WHEN** the user changes the selected organisation unit without changing the allowed org unit scope
- **THEN** the picker re-renders only for the selection change, keeping the org unit scope inputs stable

### Requirement: Default scope selects the hierarchy root org unit
The `useWizardDefaultScope` hook SHALL select the root org unit of the hierarchy (the first path segment of the shortest org unit path) as the default, rather than an arbitrary leaf org unit.

#### Scenario: Program with multi-level org unit hierarchy
- **WHEN** a program is selected whose org units have paths like `/root/region/district`
- **THEN** the default `selectedOrgUnitId` SHALL be set to the root org unit id (first segment of the path)

#### Scenario: Program org units without paths
- **WHEN** a program is selected whose org units have no `path` property
- **THEN** the default `selectedOrgUnitId` SHALL fall back to the first org unit in the list
