## 1. Storage Method Model

- [x] 1.1 Refactor the wizard storage state into a selected-method model that keeps separate WebDAV and local-directory configuration plus per-method readiness state.
- [x] 1.2 Introduce destination abstractions and composition-root wiring that can execute either WebDAV or local-directory exports without WebDAV-specific placeholder fields.
- [x] 1.3 Add test fixtures or test repository support for the new local-directory destination path and selected-method state.

## 2. Storage Step UX

- [x] 2.1 Update the storage step UI to present `WebDAV` and `Local directory` choices before method-specific configuration panels.
- [x] 2.2 Render only the active method's setup controls and notices while allowing users to switch methods without breaking the wizard flow.
- [x] 2.3 Implement local-directory selection and validation feedback for unsupported browsers, missing directory selection, and denied or invalid directory access.
- [x] 2.4 Preserve the current WebDAV validation flow when `WebDAV` is selected, including clearing readiness when WebDAV inputs change.

## 3. Execution Flow

- [x] 3.1 Add local-directory execution support that writes reviewed target paths into a user-selected root folder using the browser file-system APIs.
- [x] 3.2 Refactor the execution handoff so local-directory export can stream source downloads into destination writes without requiring a full `Blob`-only pipeline.
- [x] 3.3 Keep execution progress, interruption, logging, and result reporting consistent across WebDAV and local-directory destinations.

## 4. Verification

- [x] 4.1 Add or update unit tests for wizard validation, storage-step method switching, and method-specific readiness gating.
- [x] 4.2 Add or update execution tests covering local-directory success, unsupported-browser or permission failures, and partial local-write failures.
- [x] 4.3 Run `yarn typecheck`.
- [x] 4.4 Run `yarn lint`.
- [x] 4.5 Run targeted wizard and execution tests for the changed storage flow.
