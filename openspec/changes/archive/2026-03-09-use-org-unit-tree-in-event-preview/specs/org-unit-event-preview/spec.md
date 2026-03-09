## MODIFIED Requirements

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
