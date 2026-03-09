## 1. Execution orchestration

- [x] 1.1 Define the execution-step runner inputs from the reviewed export configuration produced by earlier wizard steps.
- [x] 1.2 Add execution/report contracts and composition-root wiring for batch execution with progress updates and cancellation support.
- [x] 1.3 Implement the WebDAV upload path for execution, evaluating whether to adopt a WebDAV npm library and reusing the same client approach for storage validation when appropriate.
- [x] 1.4 Ensure execution records per-operation success and failure results as the run progresses, including interruption state.

## 2. Execution step UI

- [x] 2.1 Replace the placeholder execution-step behavior with a UI that starts execution from the reviewed configuration and displays processed count, total count, and run state clearly.
- [x] 2.2 Add a manual interrupt action that stops further scheduling and updates the UI to reflect the interrupted run.
- [x] 2.3 Add execution-step messaging for partial failures, completed runs, and retry behavior without forcing the user to re-enter previous-step configuration.
- [x] 2.4 Add an action to download the execution result summary after completed, partially failed, or interrupted runs.

## 3. Execution report and verification

- [x] 3.1 Implement generation and download of the execution report document containing run metadata plus per-operation success and failure entries.
- [x] 3.2 Add or update tests for large-run progress reporting, cancellation/interruption behavior, partial failures, and retry visibility.
- [x] 3.3 Add or update tests for execution-report generation and download, including interrupted and mixed-result runs.
- [x] 3.4 Run `yarn typecheck`, `yarn lint`, and relevant wizard/domain tests, then fix regressions introduced by the execution-step changes.
