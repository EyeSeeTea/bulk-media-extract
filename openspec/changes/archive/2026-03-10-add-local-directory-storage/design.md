## Context

The current export flow models storage as a single WebDAV destination with URL and credentials captured in the wizard and consumed by a `validateConnection` plus `uploadFile` contract. That works for remote servers, but it does not fit browser-local export because local-directory writing depends on a user-selected directory handle, browser support for the File System Access API, and permission-granted writable streams instead of network credentials.

This change crosses domain contracts, repository wiring, wizard state, storage-step UI, and execution flow. It also has performance implications because the current execution runner downloads each source file into a `Blob` before handing it to the destination layer, which is a poor fit for multi-GB local exports.

## Goals / Non-Goals

**Goals:**
- Let the user choose a storage method in the storage step and switch between `WebDAV` and `Local directory` before execution.
- Keep the existing WebDAV flow intact while introducing a browser-local directory destination.
- Validate only the currently selected storage method and block progression until that method is ready.
- Write reviewed files into the selected local directory while preserving resolved relative paths from the export plan.
- Make the local-directory path viable for large exports by favoring streamed writes over `Blob`-only handoff.

**Non-Goals:**
- Adding ZIP export or “download each file individually” as part of this change.
- Persisting directory handles across browser sessions.
- Expanding storage support beyond WebDAV and local directory in this change.
- Guaranteeing local-directory export on browsers that do not support the required File System Access APIs.

## Decisions

### Model storage configuration as a selected method plus method-specific state
The wizard state should move from a single WebDAV-shaped object to a discriminated storage configuration with:
- a selected method identifier
- WebDAV fields and validation state
- local-directory handle metadata and validation state

This allows the UI to show method selection first, then render only the relevant configuration controls. Method-specific values should remain in state when the user switches methods so they can change their mind without losing prior input, but only the active method's validation result should unlock progression.

Alternative considered: replace the existing storage object in place whenever the user changes method. Rejected because it would discard user input unnecessarily and make method switching frustrating.

### Treat local-directory export as a separate destination adapter, not as a fake network repository
The current `StorageRepository` contract is shaped around validating a connection object and uploading a `Blob`. Local-directory export needs a different abstraction because there is no remote connection to validate and the core operation is creating nested files under a root directory handle. The implementation should introduce a destination strategy or equivalent adapter layer so WebDAV and local-directory execution can expose different setup and write mechanics while still fitting one wizard/execution flow.

Alternative considered: squeeze a directory handle into the existing WebDAV contract with placeholder URL fields. Rejected because it leaks WebDAV assumptions into a browser-local flow and would produce confusing validation and execution code.

### Use the File System Access API for local-directory selection and streamed file writes
The local-directory method should rely on `showDirectoryPicker()` to let the user choose a root folder during the storage step. Execution should create nested subdirectories and files from the resolved target path and stream response bytes into `FileSystemWritableFileStream` handles where supported. This keeps the destination aligned with the browser's local filesystem permission model and avoids a save dialog per file.

Alternative considered: trigger a normal browser download for each file. Rejected because it provides poor control over nested folder structure, scales badly for large exports, and pushes too much behavior into the browser download manager.

### Update execution handoff to support streamed destination writes
The current runner downloads each source file via `response.blob()` before passing it to storage. For large exports, the runner should support a streamed handoff so the local-directory adapter can pipe source response bodies into writable file streams without materializing every file fully in memory first. WebDAV can continue using its current behavior initially if needed, but the execution boundary should be designed so destinations are not forced to accept only `Blob` input.

Alternative considered: keep the `Blob` handoff for all destinations and accept memory growth. Rejected because it conflicts with the stated requirement to support totals in the GB range.

### Surface browser support and permission failures as validation feedback in the storage step
The storage step should validate local-directory readiness before execution by checking API availability, requiring explicit directory selection, and confirming the app can obtain the permissions needed to create files in that directory. Unsupported browser environments, dismissed pickers, or permission denials should produce actionable storage-step feedback instead of failing only after execution has started.

Alternative considered: defer all local-directory checks until the user clicks run. Rejected because it would make the storage step inconsistent with the existing “validate before execution” model and would fail too late in the flow.

## Risks / Trade-offs

- [File System Access API support is limited across browsers] -> Mitigation: present clear unsupported-browser feedback for the local-directory option while keeping WebDAV available as a fallback method.
- [Directory handles are not easily serializable or durable across sessions] -> Mitigation: keep the handle in in-memory wizard state for the current session only and require re-selection after reload.
- [Streaming support may require broader execution refactoring than a simple repository addition] -> Mitigation: isolate the execution boundary change around destination adapters and cover the new path with targeted execution tests.
- [Switching storage methods can create ambiguous validation state] -> Mitigation: track readiness per method and only use the selected method's validation result to unlock progression.
- [Local writes can partially succeed before interruption or failure] -> Mitigation: preserve the existing execution reporting model so users can see which files completed before a stop or error.

## Migration Plan

No data migration is required. The change is contained to browser-side wizard state, UI, and execution logic. Rollback consists of removing the local-directory method and restoring the storage step to WebDAV-only behavior.

## Open Questions

- Whether the first implementation should request readwrite permission during directory selection or during an explicit local-directory validation action.
- Whether WebDAV should also adopt streamed upload in the same implementation pass or remain `Blob`-based until a follow-up refactor.
