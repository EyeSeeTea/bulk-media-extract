# program-file-property-inspection Specification

## Purpose
TBD - created by archiving change add-file-aware-program-picker-preview. Update Purpose after archive.
## Requirements
### Requirement: Selected program type is shown
The system SHALL display the selected program type after a user selects a program from the picker.

#### Scenario: Program type displayed after selection
- **WHEN** the user selects a program
- **THEN** the UI displays the program type from the resolved program metadata

### Requirement: File-capable properties are listed for selected program
The system MUST display all discovered file-capable properties for the selected program using a normalized descriptor format grouped by program type and metadata source.

For tracker programs, the grouped output MUST include tracked entity section properties, program stage data element sections, and shared metadata placeholders.  
For event programs, the grouped output MUST include event data elements and shared metadata placeholders.

#### Scenario: Combined property list is rendered
- **WHEN** file-capable properties are found across multiple source types
- **THEN** the UI renders grouped sections where each property includes source type, label, and identifier

#### Scenario: No file properties for selected program
- **WHEN** a selected program has no resolvable file-capable properties at inspection time
- **THEN** the UI displays an explicit empty-state message

### Requirement: Property inspection state is explicit
The system SHALL provide loading, success, empty, and error states for property inspection.

#### Scenario: Inspection request in progress
- **WHEN** property inspection data is being fetched
- **THEN** the UI displays a loading state and prevents stale property display

#### Scenario: Inspection request fails
- **WHEN** property inspection retrieval fails
- **THEN** the UI displays an error state with retry action

