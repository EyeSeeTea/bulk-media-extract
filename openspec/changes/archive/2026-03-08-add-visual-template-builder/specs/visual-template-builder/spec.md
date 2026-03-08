## ADDED Requirements

### Requirement: Visual builder presents template editor and property browser together
The system SHALL render the template editor and available property catalog side by side in the template setup step so users can compose templates without leaving context.

#### Scenario: Side-by-side builder is visible
- **WHEN** the user opens the template setup step in the export wizard
- **THEN** the UI shows an editable template input and an interactive property list in a two-panel layout

### Requirement: Property catalog is grouped by program type and metadata source
The system MUST organize selectable properties according to the selected program type.

#### Scenario: Tracker program property groups are shown
- **WHEN** the selected program is a tracker program
- **THEN** the property catalog includes tracked entity section data, program stage data element groups, and core metadata placeholders

#### Scenario: Event program property groups are shown
- **WHEN** the selected program is an event program
- **THEN** the property catalog includes event data elements and core metadata placeholders

### Requirement: Selecting a property inserts placeholder at cursor position
The system SHALL insert the selected property placeholder token at the current cursor location in the active template input.

#### Scenario: Placeholder inserted at caret
- **WHEN** the user places the cursor in the template input and clicks a property
- **THEN** the placeholder token is inserted at that cursor position without losing existing text

### Requirement: Quick preview is shown only for valid templates
The system MUST validate template syntax and show a quick preview only when the template is valid.

#### Scenario: Valid template renders preview rows
- **WHEN** the template is valid and preview context is complete
- **THEN** the UI displays resolved preview results for up to the first 10 matching events

#### Scenario: Invalid template blocks preview
- **WHEN** the template contains syntax or placeholder validation errors
- **THEN** the UI shows validation feedback and does not render preview rows
