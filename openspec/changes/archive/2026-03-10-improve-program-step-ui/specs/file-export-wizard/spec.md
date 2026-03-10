## ADDED Requirements

### Requirement: Wizard program step presents a structured selection workflow
The system SHALL present Step 1 as a structured selection workflow with clear hierarchy between choosing a program and choosing file data values. The main interaction area MUST avoid stretching narrow form content across the full wizard width, and the step MUST keep supporting metadata visually subordinate to the primary selection actions.

#### Scenario: Step 1 uses a constrained primary content area
- **WHEN** the user opens Step 1 of the wizard
- **THEN** the program selector and file-selection controls appear in a constrained primary content area instead of spanning the full available width

#### Scenario: Step 1 hero does not repeat the step number inside the content card
- **WHEN** the user opens Step 1 of the wizard
- **THEN** the primary content card leads with the task heading and supporting copy without repeating a separate "Step 1" label inside the card

#### Scenario: Step 1 shows supporting summary information separately
- **WHEN** the user selects a program in Step 1
- **THEN** the step displays concise supporting program information adjacent to the primary input controls without leaving excessive empty space between the two regions

#### Scenario: Program summary stays hidden until a program is selected
- **WHEN** no program has been selected in Step 1
- **THEN** the supporting summary card is not shown

### Requirement: Wizard program selector uses a filterable DHIS2 form control
The system SHALL render the Step 1 program selector using a DHIS2-native filterable select control so users can search within available file-capable programs.

#### Scenario: User searches within available programs
- **WHEN** the user focuses the Step 1 program selector
- **THEN** the selector provides a filterable DHIS2 selection experience for the available programs

#### Scenario: Program selection still updates the step state
- **WHEN** the user chooses a program from the filterable selector
- **THEN** the wizard updates the selected program and refreshes the Step 1 file-data-value choices for that program

### Requirement: Wizard file data values are presented as selection-first items
The system MUST present Step 1 file data values as explicit selectable items instead of a metadata-first table. Each item MUST emphasize the selection control and file data value name, while value type and program stage remain visible as secondary supporting metadata.

#### Scenario: User scans file data values without reading a table
- **WHEN** Step 1 loads file-capable data values for the selected program
- **THEN** the user sees them as selection-first items with compact supporting metadata rather than as rows in a multi-column table

#### Scenario: User toggles a file data value from its item container
- **WHEN** the user selects or deselects a file data value in Step 1
- **THEN** the item updates the selected file set used by later wizard steps

#### Scenario: Empty state remains clear when no file data values exist
- **WHEN** the selected program does not expose any file-capable data values
- **THEN** the step shows an empty state instead of rendering selectable items

### Requirement: Wizard displays friendly program type labels
The system SHALL present friendly program type labels in the UI instead of exposing raw DHIS2 program type codes. `WITH_REGISTRATION` MUST be shown as `Tracker Program`, and `WITHOUT_REGISTRATION` MUST be shown as `Event Program`.

#### Scenario: Wizard summary shows friendly tracker label
- **WHEN** the selected program type is `WITH_REGISTRATION`
- **THEN** the wizard displays `Tracker Program` wherever the program type is shown

#### Scenario: Wizard summary shows friendly event label
- **WHEN** the selected program type is `WITHOUT_REGISTRATION`
- **THEN** the wizard displays `Event Program` wherever the program type is shown
