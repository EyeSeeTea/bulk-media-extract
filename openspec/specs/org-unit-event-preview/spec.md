# org-unit-event-preview Specification

## Purpose
TBD - created by archiving change add-file-aware-program-picker-preview. Update Purpose after archive.
## Requirements
### Requirement: Event preview requires program and org unit context
The system SHALL enable org unit selection only for org units that are registered against the currently selected program. Selection uses the `OrganisationUnitTree` component from `@dhis2/ui` instead of a flat select element. When preview is used from the export wizard, preview requests SHALL be scoped by the wizard's selected program, org unit, and date range before allowing continuation to execution.

#### Scenario: Preview blocked until required selections exist
- **WHEN** either program or organisation unit is missing
- **THEN** the preview area remains disabled and explains required selections

#### Scenario: Org unit tree shows only program org units
- **WHEN** a program is selected
- **THEN** the org unit picker renders `OrganisationUnitTree` with only the program's registered org units as selectable roots

#### Scenario: Selecting an org unit from the tree triggers preview
- **WHEN** the user selects an org unit from the tree
- **THEN** `onSelectOrgUnit` is called with the selected org unit id and event preview is triggered

#### Scenario: Wizard preview gating requires scoped context
- **WHEN** the user is in the wizard preview step without a valid date range
- **THEN** the system blocks preview execution and indicates the missing date range requirement

### Requirement: Preview returns limited sample events
The system MUST fetch and display a bounded sample of events for the selected program and organisation unit.

#### Scenario: Preview query succeeds
- **WHEN** the user selects an organisation unit after selecting a program
- **THEN** the system displays a limited sample of matching events with core context fields

#### Scenario: No events match selection
- **WHEN** preview query returns no matching events
- **THEN** the UI displays a no-results state for the current selection

### Requirement: Preview highlights file-related values
The system SHALL include file-related values for each previewed event when available.

#### Scenario: Event contains file value
- **WHEN** a previewed event contains a file-type value in a discovered property
- **THEN** the preview output includes the file-related value reference for that event

### Requirement: Preview failures are recoverable
The system SHALL provide clear error feedback and retry for failed preview requests.

#### Scenario: Preview request fails
- **WHEN** the event preview request returns an error
- **THEN** the UI shows an error state with retry option while preserving current selections

