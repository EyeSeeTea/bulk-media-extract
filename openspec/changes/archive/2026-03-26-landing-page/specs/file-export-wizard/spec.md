## MODIFIED Requirements

### Requirement: Wizard executes export through existing export workflow
The system MUST trigger export execution using the reviewed configuration from the previous wizard steps and expose progress, interruption, and failures in the wizard UI.
The execution step MUST be robust for large file lists by processing the reviewed export plan through controlled batch orchestration instead of a fire-and-forget launch action.
The execution step MUST show clear progress reporting, including processed items versus total items, and MUST preserve a run summary that includes both successes and failures.
The execution step MUST present `Processed` and `Progress` together as one summary pair and MUST present `Successes` and `Failures` together as one summary pair.
The execution step MUST display a prominent progress bar only after export execution has started, and that progress bar MUST use animation to communicate active work while reflecting the best available progress approximation.
The execution step MUST display an execution log only after export execution has started, and that log MUST be collapsed by default until the user expands it.
Expanded execution-log entries MUST remain compact and the log region MUST have a bounded scrollable height for long runs.
When execution finishes successfully, the completion notice MUST use a positive valid/success treatment and MUST expose the download-result-summary action from within that notice.
The final execution step MUST replace the wizard-level `Next` action with a `Finish` action.
When the user activates the `Finish` action, the system MUST navigate to the landing page (`/`) and the wizard state MUST be fully reset.
Once execution finishes successfully, the execution step MUST stop showing the `Latest target path` helper label.

#### Scenario: Export starts from final step using reviewed configuration
- **WHEN** the user confirms execution on the final step with a valid reviewed configuration
- **THEN** the system starts export processing from that reviewed configuration and shows progress updates for the running batch

#### Scenario: Export failure is visible and recoverable
- **WHEN** export execution fails for one or more files
- **THEN** the system shows error details and allows the user to retry execution without re-entering unaffected configuration

#### Scenario: Execution step reports progress for large runs
- **WHEN** the reviewed export plan contains many files and execution is in progress
- **THEN** the system displays clear progress information including processed count, total count, current run state, the grouped summary indicators, and the prominent progress bar while the batch continues

#### Scenario: Execution progress UI stays hidden before start
- **WHEN** the user has not started export execution yet
- **THEN** the execution step does not display the progress bar or the execution log

#### Scenario: Execution log is available but collapsed after start
- **WHEN** the user starts an export run
- **THEN** the execution step displays an execution log control in a collapsed state by default and allows the user to expand it to inspect detailed activity

#### Scenario: Expanded execution log remains compact on long runs
- **WHEN** the user expands the execution log after many log entries have accumulated
- **THEN** the execution step shows compact log entries inside a bounded scrollable region instead of letting the log grow without limit

#### Scenario: Successful completion notice includes result-summary action
- **WHEN** an execution run finishes successfully
- **THEN** the execution step displays a positive completion notice and includes the download-result-summary action within that success feedback region

#### Scenario: Final step exposes finish action
- **WHEN** the user is on the execution step
- **THEN** the wizard footer displays a `Finish` action instead of `Next` as the end-of-flow affordance

#### Scenario: Finish action navigates to landing page and resets state
- **WHEN** the user activates the `Finish` action on the execution step
- **THEN** the system navigates to the landing page at `/` and the wizard state is fully reset for the next session

#### Scenario: Successful completion hides latest target path helper
- **WHEN** an execution run finishes successfully
- **THEN** the execution step no longer shows the `Latest target path` helper label

#### Scenario: User interrupts execution manually
- **WHEN** the user activates the execution-step interrupt action during a running export
- **THEN** the system stops scheduling further file transfers, marks the run as interrupted, and preserves the partial result summary collected so far

#### Scenario: User downloads execution result summary
- **WHEN** an execution run finishes, fails partially, or is interrupted
- **THEN** the system provides an action to download the execution result summary containing successes and failures for that run

### Requirement: Wizard provides a prominent footer action bar
The system SHALL render wizard navigation actions inside a dedicated footer action bar that visually separates navigation from step content. The primary forward action MUST be visually prominent and MUST always be right-aligned regardless of whether the back action is present. The back action MUST remain clearly available without being crowded against the page edge.
The back action MUST be hidden when the user is on the first step of the wizard, not merely disabled.
The forward action (Next) MUST be visually disabled when the current step has a validation error, providing clear feedback that the step is not yet complete.

#### Scenario: Step actions are visually grouped and spaced
- **WHEN** the user views any wizard step
- **THEN** Back and forward actions appear in a dedicated footer region with clear spacing and alignment

#### Scenario: Forward action stays right-aligned without Back
- **WHEN** the user is on the first step and the Back button is hidden
- **THEN** the forward action (Next) remains right-aligned in the footer

#### Scenario: Back button is hidden on the first step
- **WHEN** the user is on the first step of the wizard
- **THEN** the back action is not rendered in the footer

#### Scenario: Back button is visible on subsequent steps
- **WHEN** the user is on any step after the first
- **THEN** the back action is visible and enabled in the footer

#### Scenario: Next button is visually disabled when step has validation error
- **WHEN** the current step has a validation error
- **THEN** the Next button is rendered in a visually disabled state

#### Scenario: Next button is enabled when step is valid
- **WHEN** the current step passes validation
- **THEN** the Next button is enabled and clickable

#### Scenario: Footer actions remain usable on narrow layouts
- **WHEN** the wizard is rendered on a narrow viewport
- **THEN** the footer action bar adapts without clipping or obscuring the navigation actions

## ADDED Requirements

### Requirement: Wizard provides a header-level exit action with confirmation
The wizard page MUST display a page header titled "Export program files" with a back/exit button above the wizard steps that allows the user to leave the wizard from any step. The page header MUST be visually distinct from the wizard step content through a bottom border and subtle background treatment.
Activating the exit action MUST present a confirmation modal titled "Exit current export" warning that all configuration will be lost. The modal buttons MUST have visible spacing between them. If the user confirms, the system MUST navigate to the landing page (`/`). If the user dismisses the modal, the wizard MUST remain on the current step with all state preserved.
The exit action MUST be disabled while an export execution is running.

#### Scenario: Exit action is visible in the wizard header
- **WHEN** the user is on any wizard step
- **THEN** a back/exit action is visible in the page header above the wizard steps

#### Scenario: Exit triggers confirmation modal
- **WHEN** the user activates the header exit action
- **THEN** the system displays a confirmation modal warning that all progress will be lost and offering confirm and dismiss options

#### Scenario: Confirming exit navigates to landing page
- **WHEN** the user confirms the exit action in the modal
- **THEN** the system navigates to the landing page at `/` and the wizard state is fully reset

#### Scenario: Dismissing exit preserves wizard state
- **WHEN** the user dismisses the exit confirmation modal
- **THEN** the wizard remains on the current step with all entered values preserved

#### Scenario: Exit is disabled during execution
- **WHEN** an export execution is currently running
- **THEN** the header exit action is disabled to prevent interrupting the process via navigation
