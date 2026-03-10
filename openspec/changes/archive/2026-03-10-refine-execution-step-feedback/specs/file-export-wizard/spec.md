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
The final execution step MUST replace the wizard-level `Next` action with a `Finish` action even before a concrete completion flow is implemented.  
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
- **THEN** the wizard footer displays a `Finish` action instead of `Next` as the end-of-flow affordance even if that action does not yet complete additional behavior

#### Scenario: Successful completion hides latest target path helper
- **WHEN** an execution run finishes successfully
- **THEN** the execution step no longer shows the `Latest target path` helper label

#### Scenario: User interrupts execution manually
- **WHEN** the user activates the execution-step interrupt action during a running export
- **THEN** the system stops scheduling further file transfers, marks the run as interrupted, and preserves the partial result summary collected so far

#### Scenario: User downloads execution result summary
- **WHEN** an execution run finishes, fails partially, or is interrupted
- **THEN** the system provides an action to download the execution result summary containing successes and failures for that run
