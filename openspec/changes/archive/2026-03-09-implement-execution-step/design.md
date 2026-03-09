## Context

The current execution step in the wizard is a minimal UI shell with a start button, a percentage label, and a generic success or error notice. It does not orchestrate large file lists safely, does not preserve a structured result set for later download, and does not let the user stop a run once it starts. That gap is operationally significant because export execution is the point where the app performs the most expensive and failure-prone work: browser downloads from DHIS2, uploads to WebDAV, and per-file path handling across potentially large reviewed batches.

The implementation must respect the existing clean architecture. The execution step should consume the previously reviewed export configuration rather than rebuilding scope from ad hoc UI state, and it should expose cancellation and run-summary state through explicit orchestration. The project already added a native WebDAV validation repository, but this change may justify introducing a dedicated WebDAV client package so upload behavior and connection validation share the same protocol handling rather than maintaining custom request logic in multiple places.

## Goals / Non-Goals

**Goals:**
- Turn the execution step into a robust batch runner for the reviewed export plan from earlier wizard steps.
- Provide clear progress reporting for long-running exports, including counts, totals, and run state visibility.
- Allow the user to manually interrupt an in-progress execution and preserve the partial run summary collected so far.
- Produce a downloadable execution result summary that includes both successes and failures.
- Evaluate and document a reusable WebDAV library approach so uploads and connection validation can share protocol handling instead of duplicating low-level request code.

**Non-Goals:**
- Changing how preview builds the reviewed export scope beyond consuming its existing execution configuration.
- Introducing server-side job orchestration or a backend queue in this change.
- Adding support for storage providers other than WebDAV.
- Guaranteeing resumable execution across full page reloads or browser restarts.

## Decisions

### Drive execution from the reviewed execution-configuration model
The execution step should operate on the same reviewed export configuration built from previous steps, not re-derive file operations from scattered wizard state at run time. This keeps execution aligned with what the user already previewed and avoids divergence between preview and upload behavior.

Alternative considered: rebuild execution inputs directly from current wizard fields at the moment the user clicks run. Rejected because it can drift from the reviewed preview result and makes interruption/reporting harder to reason about.

### Introduce a dedicated execution runner with cancellable batch orchestration
Execution should be modeled as a runner that processes operations sequentially or with tightly controlled concurrency, emits progress updates after each completed attempt, and holds a cancellation handle so the user can stop further work. The runner should record each completed attempt as either success or failure in an accumulating in-memory report.

Alternative considered: fire all uploads in parallel from the component and derive progress from settled promises. Rejected because it is brittle for large batches, harder to cancel safely, and more likely to overload the browser or the remote storage server.

### Add an execution report artifact with per-operation results
The app should produce a structured execution report object containing the reviewed context, run timestamps, interruption status, totals, and per-operation results. The downloadable summary can then be serialized to JSON without coupling the UI to a one-off string export format.

Alternative considered: only show a transient on-screen summary with aggregate counts. Rejected because users need a durable artifact they can review, share, or attach to support/debugging workflows.

### Prefer a maintained WebDAV client library for upload and validation behavior
The change should evaluate using a WebDAV npm package to handle protocol details such as authentication, `PROPFIND`, directory creation, and file upload primitives. If adopted, the same client abstraction should be used for both execution uploads and storage connection validation to reduce duplicated protocol code and improve correctness.

Alternative considered: continue extending the custom fetch-based WebDAV code. Rejected because this area is protocol-sensitive, likely to grow in complexity during execution work, and is exactly where a maintained library can reduce reinvention risk.

### Keep progress reporting based on concrete processed counts, not only percentages
The UI should report processed files versus total files, plus separate success and failure counts, and derive percentages from those counts. This is clearer for big batches and gives users confidence that the run is still moving even if some items fail.

Alternative considered: only show a progress percentage. Rejected because a standalone percentage is too opaque for long-running file transfers and does not communicate partial failures well.

## Risks / Trade-offs

- [Risk] Large exports may still feel slow in the browser even with controlled batching. -> Mitigation: use conservative concurrency, incremental progress updates, and explicit interruption support.
- [Risk] Cancellation cannot stop network requests that have already been handed off to the browser or library at the exact same instant. -> Mitigation: define interruption as “stop scheduling new operations” and report already-settling operations accurately.
- [Risk] Introducing a WebDAV dependency increases package surface area. -> Mitigation: keep the abstraction behind the storage repository boundary and validate the library against both connection-test and upload needs.
- [Trade-off] A JSON execution report is easy to generate and parse, but less human-friendly than CSV for non-technical users. -> Mitigation: start with JSON as the stable contract and evaluate other export formats later if needed.

## Migration Plan

1. Add execution/report domain contracts and composition-root wiring for cancellable batch execution.
2. Implement the WebDAV upload path and, if adopted, refactor connection validation to use the same client abstraction.
3. Replace the placeholder execution-step UI with live progress, interruption, and result-download behavior.
4. Add tests for long-run progress updates, interruption, partial failure handling, and report generation.
5. Run typecheck, lint, and relevant wizard/domain tests before merging.

Rollback strategy: revert the execution-runner and UI changes and fall back to the previous placeholder execution step; no persistent data migration is involved.

## Open Questions

- Should interrupted runs allow a selective retry of only failed or unprocessed operations in this change, or should retry remain full-run only for now?
- If a WebDAV npm package is adopted, which specific library best fits browser support, bundle size, and authentication requirements in this app?
