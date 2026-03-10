## ADDED Requirements

### Requirement: Program details display friendly program type labels
The system SHALL present friendly program type labels in landing-page program details instead of exposing raw DHIS2 program type codes. `WITH_REGISTRATION` MUST be shown as `Tracker Program`, and `WITHOUT_REGISTRATION` MUST be shown as `Event Program`.

#### Scenario: Landing page details show tracker label
- **WHEN** the selected program type is `WITH_REGISTRATION`
- **THEN** the program details display `Tracker Program`

#### Scenario: Landing page details show event label
- **WHEN** the selected program type is `WITHOUT_REGISTRATION`
- **THEN** the program details display `Event Program`
