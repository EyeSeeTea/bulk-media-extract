## ADDED Requirements

### Requirement: Wizard page is composed from dedicated shell and step modules
The system SHALL implement the file export wizard page as a composition of dedicated shell and step components rather than a single monolithic route component.

#### Scenario: Route entry renders shared wizard shell
- **WHEN** the wizard route is mounted
- **THEN** the route entry SHALL render a dedicated shared shell component that owns the step navigation, validation framing, and footer actions

#### Scenario: Current step renders through a dedicated step module
- **WHEN** any wizard step is active
- **THEN** the shell SHALL render that step through a dedicated step component instead of inline step markup inside the route entry

### Requirement: Each wizard step has a focused presentation module
The system SHALL provide a focused presentation module for each existing wizard step: program, template, preview, storage, and execution.

#### Scenario: Step-specific UI is isolated by responsibility
- **WHEN** examining the wizard implementation
- **THEN** each existing step SHALL have its own component module responsible for rendering that step's UI and interactions

#### Scenario: Shared step primitives are reusable
- **WHEN** multiple wizard steps use the same intro or summary presentation pattern
- **THEN** the implementation SHALL provide reusable presentational primitives instead of duplicating the same markup in multiple step modules

### Requirement: Wizard page remains a thin orchestration layer
The system SHALL keep `WizardPage` as a thin orchestration layer that wires providers and top-level wizard composition without embedding full step implementations.

#### Scenario: WizardPage does not own full step JSX
- **WHEN** examining `WizardPage` implementation
- **THEN** it SHALL compose the provider and top-level wizard container without embedding the full JSX for the program, template, preview, storage, and execution steps

#### Scenario: WizardPage preserves existing entry-point responsibilities
- **WHEN** the wizard route needs app-context dependencies such as storage validation wiring
- **THEN** `WizardPage` SHALL continue to provide those dependencies at the page boundary while delegating step rendering to child modules
