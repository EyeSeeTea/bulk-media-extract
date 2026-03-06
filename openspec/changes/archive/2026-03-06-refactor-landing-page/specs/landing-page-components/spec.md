## ADDED Requirements

### Requirement: ProgramPicker component displays program selection
The system SHALL provide a `ProgramPicker` component that displays a dropdown for selecting file-capable programs with a reload button.

#### Scenario: Display loading state
- **WHEN** programs are being loaded
- **THEN** the component SHALL display a loading indicator

#### Scenario: Display error state
- **WHEN** program loading fails
- **THEN** the component SHALL display an error notice with the error message

#### Scenario: Display program dropdown on success
- **WHEN** programs are loaded successfully
- **THEN** the component SHALL display a dropdown with all programs and a placeholder option

#### Scenario: Handle program selection
- **WHEN** user selects a program from the dropdown
- **THEN** the component SHALL call the `onSelectProgram` callback with the selected program ID

#### Scenario: Reload programs button
- **WHEN** user clicks the reload button
- **THEN** the component SHALL trigger a refetch of programs

### Requirement: ProgramDetails component displays program file properties
The system SHALL provide a `ProgramDetails` component that displays file properties for a selected program.

#### Scenario: No program selected state
- **WHEN** no program is selected
- **THEN** the component SHALL display a notice prompting user to select a program

#### Scenario: Display loading state
- **WHEN** program details are being loaded
- **THEN** the component SHALL display a loading indicator

#### Scenario: Display error state
- **WHEN** program details loading fails
- **THEN** the component SHALL display an error notice with the error message

#### Scenario: Display program details on success
- **WHEN** program details are loaded successfully
- **THEN** the component SHALL display the program type and list of file properties

#### Scenario: Display empty state for no file properties
- **WHEN** program has no file properties
- **THEN** the component SHALL display a notice indicating no file properties found

### Requirement: EventPreview component displays org unit selection and event table
The system SHALL provide an `EventPreview` component that displays organisation unit selection and a preview table of events.

#### Scenario: Display loading state for org units
- **WHEN** organisation units are being loaded
- **THEN** the component SHALL display a loading indicator

#### Scenario: Display error state for org units
- **WHEN** organisation units loading fails
- **THEN** the component SHALL display an error notice with the error message

#### Scenario: Display org unit dropdown on success
- **WHEN** organisation units are loaded successfully
- **THEN** the component SHALL display a dropdown with all org units and a placeholder option

#### Scenario: Disable org unit selection without program
- **WHEN** no program is selected
- **THEN** the org unit dropdown SHALL be disabled

#### Scenario: Display requirements notice
- **WHEN** either program or org unit is not selected
- **THEN** the component SHALL display a notice about selection requirements

#### Scenario: Display loading state for events
- **WHEN** events are being loaded
- **THEN** the component SHALL display a loading indicator

#### Scenario: Display error state for events with retry
- **WHEN** event preview loading fails
- **THEN** the component SHALL display an error notice with a retry button

#### Scenario: Display event table on success
- **WHEN** events are loaded successfully
- **THEN** the component SHALL display a table with event ID, date, org unit, and file values

#### Scenario: Display empty state for no events
- **WHEN** no events match the selections
- **THEN** the component SHALL display a notice indicating no events found

### Requirement: LandingPage orchestrates child components
The system SHALL keep `LandingPage` as a thin orchestration layer that composes child components without containing business logic.

#### Scenario: Render all three sections
- **WHEN** LandingPage is mounted
- **THEN** it SHALL render ProgramPicker, ProgramDetails, and EventPreview components

#### Scenario: Pass selected state to components
- **WHEN** user selects a program or org unit
- **THEN** LandingPage SHALL pass the selection state to child components via props

#### Scenario: No data fetching logic in LandingPage
- **WHEN** examining LandingPage implementation
- **THEN** it SHALL NOT contain useCallback, useEffect, or direct API calls
