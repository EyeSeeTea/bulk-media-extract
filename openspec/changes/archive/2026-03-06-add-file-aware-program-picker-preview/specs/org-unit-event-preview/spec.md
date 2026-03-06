## ADDED Requirements

### Requirement: Event preview requires program and org unit context
The system SHALL enable event preview only after both a program and an organisation unit are selected.

#### Scenario: Preview blocked until required selections exist
- **WHEN** either program or organisation unit is missing
- **THEN** the preview area remains disabled and explains required selections

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
