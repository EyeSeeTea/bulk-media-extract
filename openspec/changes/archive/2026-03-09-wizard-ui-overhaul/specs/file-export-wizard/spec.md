## ADDED Requirements

### Requirement: Wizard provides a prominent footer action bar
The system SHALL render wizard navigation actions inside a dedicated footer action bar that visually separates navigation from step content. The primary forward action MUST be visually prominent, and the back action MUST remain clearly available without being crowded against the page edge.

#### Scenario: Step actions are visually grouped and spaced
- **WHEN** the user views any wizard step
- **THEN** Back and forward actions appear in a dedicated footer region with clear spacing and alignment instead of as small buttons attached to the far left of the content area

#### Scenario: Footer actions remain usable on narrow layouts
- **WHEN** the wizard is rendered on a narrow viewport
- **THEN** the footer action bar adapts without clipping or obscuring the navigation actions

### Requirement: Wizard step content uses a consistent intro and section rhythm
The system SHALL present each wizard step with a consistent content hierarchy so titles, support copy, and section containers follow the same visual rhythm across the full flow. The step body MUST avoid giving one step an oversized hero treatment that is not matched by comparable framing in the other steps.

#### Scenario: Step 1 no longer dominates the flow with a unique oversized hero
- **WHEN** the user opens the wizard and compares Step 1 with later steps
- **THEN** Step 1 uses the same general intro hierarchy as the other steps instead of a uniquely oversized title block

#### Scenario: Page content ends with intentional breathing room
- **WHEN** the user reaches the end of a step with a long content body
- **THEN** the wizard layout keeps visible bottom padding below the final content and action area

## MODIFIED Requirements

### Requirement: Wizard step navigation clearly identifies the current step
The system SHALL make the currently selected wizard step visually distinct from completed, available, and disabled upcoming steps. Each step tab MUST expose the step number before the step title, the active step tab MUST expose `aria-current="step"`, and completed valid steps MUST include a positive completion indicator such as a tick icon. The visual treatment MUST align with DHIS2-style blue-accented navigation rather than relying on generic neutral cards alone.

#### Scenario: Active step tab is explicitly marked
- **WHEN** the user is on any wizard step
- **THEN** the corresponding step tab is styled as the current step, exposes `aria-current="step"`, and presents its step number with stronger active emphasis than the other tabs

#### Scenario: Completed steps provide reassuring completion feedback
- **WHEN** the user has completed a valid step and advanced beyond it
- **THEN** the completed step tab remains visibly distinct from the active and upcoming steps and includes a completion indicator that reassures the user the step is done

#### Scenario: Disabled upcoming steps look unavailable
- **WHEN** the user has not yet unlocked a future step
- **THEN** that step tab appears visibly disabled and cannot be mistaken for the current or completed steps

### Requirement: Wizard step content avoids repeating the active step title
The system SHALL rely on the step tabs to communicate the active step identity and MUST NOT display a redundant progress subtitle such as `Step X of Y: Title` above the step content. Step content MAY include its own concise intro title and support copy, but that intro MUST complement the shell hierarchy instead of reintroducing duplicate progress labeling.

#### Scenario: Progress subtitle is removed from the wizard shell
- **WHEN** the user opens any wizard step
- **THEN** the page does not render a `Step X of Y: Title` subtitle above the step tabs

#### Scenario: Step intro complements the shell instead of duplicating progress
- **WHEN** a step displays an internal title or support copy
- **THEN** that content guides the task within the step without repeating the shell-level progress label or conflicting with the step tab identity

### Requirement: Wizard program step presents a structured selection workflow
The system SHALL present Step 1 as a structured selection workflow with clear hierarchy between choosing a program and choosing file data values. The main interaction area MUST avoid stretching narrow form content across the full wizard width, the step MUST keep supporting metadata visually subordinate to the primary selection actions, and its intro treatment MUST stay consistent with the shared hierarchy used by later steps.

#### Scenario: Step 1 uses a constrained primary content area
- **WHEN** the user opens Step 1 of the wizard
- **THEN** the program selector and file-selection controls appear in a constrained primary content area instead of spanning the full available width

#### Scenario: Step 1 intro follows the shared wizard hierarchy
- **WHEN** the user opens Step 1 of the wizard
- **THEN** the step introduces the task with the same overall heading and support-copy rhythm used by the other wizard steps instead of a uniquely dominant hero block

#### Scenario: Step 1 shows supporting summary information separately
- **WHEN** the user selects a program in Step 1
- **THEN** the step displays concise supporting program information adjacent to the primary input controls without leaving excessive empty space between the two regions

#### Scenario: Program summary stays hidden until a program is selected
- **WHEN** no program has been selected in Step 1
- **THEN** the supporting summary card is not shown
