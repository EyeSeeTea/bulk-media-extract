## ADDED Requirements

### Requirement: Wizard pages SHALL remain page-focused
The system SHALL keep `webapp/pages` limited to route assembly, page composition, and page-local presentation concerns. Pure workflow logic, execution models, infrastructure adapters, and reusable shell primitives MUST NOT live under a page folder unless they are genuinely page-specific presentation helpers.

#### Scenario: Non-page modules are moved out of wizard page folders
- **WHEN** the codebase contains execution planning, export reporting, filesystem access, or template resolution logic for the wizard
- **THEN** those modules live outside `webapp/pages/wizard` unless they are strictly tied to rendering behavior of that page

#### Scenario: Route components stay thin
- **WHEN** a wizard route component is reviewed
- **THEN** it primarily wires page state, controllers, and presentational components instead of embedding cross-step validation, orchestration, and infrastructure branching inline

### Requirement: Generic wizard shell UI SHALL live in shared components
The system SHALL place reusable wizard UI primitives such as shells, step navigation, and shared step framing under `webapp/components` or an equivalent shared presentation area rather than inside a specific page feature folder.

#### Scenario: Shared wizard shell is not page-owned
- **WHEN** multiple flows can reuse the same wizard shell or step-navigation pattern
- **THEN** that shell is defined in a shared components area and imported by pages as needed

#### Scenario: Step presentation remains separate from step workflow
- **WHEN** a step component renders content for program selection, template setup, preview, storage, or execution
- **THEN** the step component receives prepared state and actions from a controller or support hook rather than assembling unrelated concerns inside the JSX module
