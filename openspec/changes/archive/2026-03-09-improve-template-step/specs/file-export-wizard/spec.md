## ADDED Requirements

### Requirement: Wizard step navigation clearly identifies the current step
The system SHALL make the currently selected wizard step visually distinct from completed and upcoming steps, and the active step tab MUST expose `aria-current="step"`.

#### Scenario: Active step tab is explicitly marked
- **WHEN** the user is on any wizard step
- **THEN** the corresponding step tab is styled as the current step and exposes `aria-current="step"`

### Requirement: Template step sections use clearer panel hierarchy
The system SHALL render template-step content in visually distinct sections so filters, template editing, and validation/preview feedback are easier to scan.

#### Scenario: Template step panels are visually separated
- **WHEN** the user opens the template step
- **THEN** filter controls, template builders, and preview/validation feedback each appear in clearly separated section panels

### Requirement: Wizard step content avoids repeating the active step title
The system SHALL rely on the step tabs and step-progress subtitle to identify the active step and MUST NOT repeat the same step title again as the primary heading inside the step content.

#### Scenario: Active step title is not duplicated in content
- **WHEN** the user opens a wizard step that is already identified by the step tabs and step-progress subtitle
- **THEN** the step content does not repeat that same title as another primary heading
