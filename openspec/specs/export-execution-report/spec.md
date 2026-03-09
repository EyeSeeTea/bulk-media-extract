# export-execution-report Specification

## Purpose
TBD - created by archiving change implement-execution-step. Update Purpose after archive.

## Requirements
### Requirement: Execution report captures export run outcome
The system SHALL define a downloadable execution report document that records the outcome of a wizard execution run.  
The report MUST include a schema version, reviewed execution context, run start timestamp, run end timestamp when available, run status, total operation count, success count, failure count, and interruption flag.

#### Scenario: Report records run-level execution metadata
- **WHEN** the system generates an execution report after a run
- **THEN** the resulting document includes identifiers and summary fields that describe the reviewed export plan and the final run outcome

### Requirement: Execution report includes per-operation success and failure results
The execution report MUST contain one result entry per attempted export operation and MUST distinguish successes from failures.  
Each result entry MUST include enough context to identify the source file and target path, and failure entries MUST include an error message describing the failed transfer outcome.

#### Scenario: Report contains mixed success and failure entries
- **WHEN** an execution run completes with some successful transfers and some failed transfers
- **THEN** the generated report includes entries for each attempted operation and marks each one with its corresponding success or failure outcome

### Requirement: Execution report supports interrupted runs
The execution report MUST represent interrupted runs explicitly and MUST preserve the results collected before interruption.  
Operations not yet attempted at the moment of interruption MAY be omitted from the per-operation results, but the run summary MUST indicate that execution ended early.

#### Scenario: Interrupted run report preserves partial results
- **WHEN** the user interrupts an execution after some operations have already succeeded or failed
- **THEN** the downloaded report marks the run as interrupted and includes the partial results collected before execution stopped
