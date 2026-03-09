## MODIFIED Requirements

### Requirement: Wizard executes export through existing export workflow
The system MUST trigger export execution using the reviewed configuration from the previous wizard steps and expose progress, interruption, and failures in the wizard UI.  
The execution step MUST be robust for large file lists by processing the reviewed export plan through controlled batch orchestration instead of a fire-and-forget launch action.  
The execution step MUST show clear progress reporting, including processed items versus total items, and MUST preserve a run summary that includes both successes and failures.

#### Scenario: Export starts from final step using reviewed configuration
- **WHEN** the user confirms execution on the final step with a valid reviewed configuration
- **THEN** the system starts export processing from that reviewed configuration and shows progress updates for the running batch

#### Scenario: Export failure is visible and recoverable
- **WHEN** export execution fails for one or more files
- **THEN** the system shows error details and allows the user to retry execution without re-entering unaffected configuration

#### Scenario: Execution step reports progress for large runs
- **WHEN** the reviewed export plan contains many files and execution is in progress
- **THEN** the system displays clear progress information including processed count, total count, and current run state while the batch continues

#### Scenario: User interrupts execution manually
- **WHEN** the user activates the execution-step interrupt action during a running export
- **THEN** the system stops scheduling further file transfers, marks the run as interrupted, and preserves the partial result summary collected so far

#### Scenario: User downloads execution result summary
- **WHEN** an execution run finishes, fails partially, or is interrupted
- **THEN** the system provides an action to download the execution result summary containing successes and failures for that run
