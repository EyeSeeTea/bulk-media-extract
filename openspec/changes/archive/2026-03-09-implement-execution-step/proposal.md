## Why

The wizard's execution step is currently too thin for real exports: it does not give users enough control or feedback when processing large file batches, and it does not preserve a durable summary of what succeeded or failed. This change is needed now so the final step becomes operationally trustworthy instead of a fragile launch button.

## What Changes

- Replace the current placeholder execution-step behavior with a robust batch execution flow that uses the reviewed configuration from previous wizard steps.
- Add clear progress reporting for long-running exports, including processed counts and visible failure state.
- Allow users to manually interrupt an in-progress execution without losing the run summary already collected.
- Add a downloadable execution result summary that records successes, failures, and interruption state for the completed or partial run.
- Introduce an execution implementation strategy that can scale to larger file lists and centralize WebDAV transfer behavior, with an option to reuse a dedicated WebDAV npm library for both upload execution and connection validation.

## Capabilities

### New Capabilities

- `export-execution-report`: Defines the downloadable result-summary artifact produced by an execution run, including success and failure details.

### Modified Capabilities

- `file-export-wizard`: Strengthen the execution step requirements around robust batch processing, live progress reporting, interruption, and downloadable execution results.

## Impact

- Affected code: wizard execution-step UI/state, export orchestration in `src/webapp/pages/wizard/`, composition-root wiring, and related tests.
- Affected domain/data flow: execution must consume the previously reviewed export configuration and produce a structured run summary while supporting cancellation.
- APIs/systems: WebDAV upload behavior becomes a first-class runtime dependency for execution; the implementation may introduce a WebDAV client library that can also be reused by storage connection validation.
