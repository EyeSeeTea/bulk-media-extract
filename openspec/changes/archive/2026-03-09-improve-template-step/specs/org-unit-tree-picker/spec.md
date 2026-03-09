## ADDED Requirements

### Requirement: OrgUnitTreePicker keeps tree configuration stable across rerenders
The system MUST preserve stable tree-query inputs for `OrganisationUnitTree` while the allowed organisation unit scope is unchanged, so rerenders from selection updates or parent updates do not trigger the DHIS2 static-query warning.

#### Scenario: Selection changes do not recreate tree query configuration
- **WHEN** the user changes the selected organisation unit without changing the allowed org unit scope
- **THEN** the picker updates the selection while keeping the wrapped DHIS2 tree configuration stable enough to avoid the static-query warning
