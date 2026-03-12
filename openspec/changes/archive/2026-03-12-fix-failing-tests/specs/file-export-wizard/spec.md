## MODIFIED Requirements

### Requirement: Wizard displays friendly program type labels
The system SHALL present friendly program type labels in the UI instead of exposing raw DHIS2 program type codes. `WITH_REGISTRATION` MUST be shown as `Tracker Program`, and `WITHOUT_REGISTRATION` MUST be shown as `Event Program`.

#### Scenario: Wizard summary shows friendly tracker label
- **WHEN** the selected program type is `WITH_REGISTRATION`
- **THEN** the wizard displays `Tracker Program` wherever the program type is shown

#### Scenario: Wizard summary shows friendly event label
- **WHEN** the selected program type is `WITHOUT_REGISTRATION`
- **THEN** the wizard displays `Event Program` wherever the program type is shown
