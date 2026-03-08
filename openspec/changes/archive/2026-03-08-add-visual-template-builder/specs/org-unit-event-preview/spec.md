## MODIFIED Requirements

### Requirement: Preview returns limited sample events
The system MUST fetch and display a bounded sample of events for the selected program and organisation unit, capped to the first 10 events for quick feedback.  
When a valid template is provided, the preview MUST include each event's resolved template output.

#### Scenario: Preview query succeeds
- **WHEN** the user selects an organisation unit after selecting a program and entering a valid template
- **THEN** the system displays up to 10 matching events with core context fields and resolved template output

#### Scenario: No events match selection
- **WHEN** preview query returns no matching events
- **THEN** the UI displays a no-results state for the current selection
