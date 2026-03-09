# org-unit-event-preview Specification

## Purpose
TBD - created by archiving change add-file-aware-program-picker-preview. Update Purpose after archive.
## Requirements
### Requirement: Event preview requires program and org unit context
The system SHALL display a hierarchical `OrganisationUnitTree` for org unit selection in event preview, with selectable nodes restricted to the org units registered for the currently selected program.

#### Scenario: Org unit tree renders with program-specific roots
- **WHEN** a program is selected and its org units are available
- **THEN** the tree is rooted at the program's org units, preventing selection of unrelated org units

#### Scenario: Preview blocked until required selections exist
- **WHEN** either program or organisation unit is missing
- **THEN** the preview area remains disabled and explains required selections

#### Scenario: Preview query succeeds
- **WHEN** the user selects an organisation unit from the tree after selecting a program
- **THEN** the system displays a limited sample of matching events with core context fields

#### Scenario: No events match selection
- **WHEN** preview query returns no matching events
- **THEN** the UI displays a no-results state for the current selection

### Requirement: Preview returns limited sample events
The system MUST fetch and display a bounded sample of events for the selected program and organisation unit, capped to the first 10 events for quick feedback.  
When a valid template is provided, the preview MUST include each event's resolved template output.

#### Scenario: Preview query succeeds
- **WHEN** the user selects an organisation unit after selecting a program and entering a valid template
- **THEN** the system displays up to 10 matching events with core context fields and resolved template output

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

