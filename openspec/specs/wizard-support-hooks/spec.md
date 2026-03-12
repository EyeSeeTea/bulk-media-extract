## ADDED Requirements

### Requirement: Wizard support hooks encapsulate step-specific derived state
The system SHALL provide wizard-specific support hooks, controllers, or application-facing adapters that encapsulate derived state needed by step components. These modules MUST expose cohesive request objects and concern-oriented results instead of wide positional parameter lists. A step support module MUST prepare only the state and actions relevant to its step or workflow slice.

#### Scenario: Program and template steps consume prepared derived data
- **WHEN** the program or template step renders
- **THEN** the step component SHALL receive prepared derived data for selected program details, selectable file properties, mappings, or template-property groupings from a dedicated wizard support module

#### Scenario: Preview step consumes prepared preview data
- **WHEN** the preview step renders
- **THEN** the step component SHALL receive prepared preview rows, summary data, and duplicate-path diagnostics from a dedicated wizard support module or existing preview helper adapter

#### Scenario: Support modules avoid positional APIs
- **WHEN** a wizard support module needs many inputs to compute its result
- **THEN** it accepts a typed request object or narrower concern-specific objects instead of a long positional argument list

### Requirement: Wizard support hooks encapsulate async side effects and execution lifecycle control
The system SHALL keep async side effects and execution lifecycle coordination outside of step presentation components. Presentation-facing hooks or controllers MUST delegate browser APIs, transport access, and storage-specific behavior to application services or infrastructure adapters rather than invoking those concerns inline.

#### Scenario: Execution step uses a dedicated lifecycle controller
- **WHEN** the execution step starts, updates, cancels, or finishes a run
- **THEN** the run lifecycle SHALL be coordinated through a dedicated wizard support module that wraps the existing execution runner behavior

#### Scenario: Selection normalization and cleanup are not embedded in presentational JSX
- **WHEN** wizard state changes require normalization or cleanup side effects
- **THEN** those effects SHALL live in wizard support hooks or controller modules instead of being interleaved with presentational JSX

#### Scenario: Presentation hooks do not own infrastructure branching
- **WHEN** a wizard support hook handles execution or storage workflow
- **THEN** it does not directly issue `fetch`, create DOM download links, or write to local directories without going through dedicated adapters or use cases

### Requirement: Wizard support modules are testable independently from the page shell
The system SHALL organize wizard support hooks and controllers so their derived-data and lifecycle behavior can be tested without rendering the entire wizard page. Support modules with business orchestration MUST be testable without requiring DOM-only collaborators unless the behavior is explicitly presentation-specific.

#### Scenario: Derived-data logic can be validated without full page rendering
- **WHEN** wizard support modules are tested
- **THEN** their output for derived state and action handlers SHALL be verifiable independently from the full route component

#### Scenario: Execution lifecycle behavior can be validated without full page rendering
- **WHEN** execution lifecycle behavior is tested
- **THEN** cancellation, completion, and status updates SHALL be verifiable without relying solely on a full wizard integration test
