## Why

The wizard currently assumes that every export destination is a remote WebDAV server, which blocks a common browser-native use case: saving exported files directly to the user's local computer. This is worth adding now because local-directory export removes server-side setup for some deployments and is a better fit for large browser-managed exports where users want the resolved folder structure written directly to disk.

## What Changes

- Add a new browser-local storage method that writes export output into a user-selected local directory instead of a remote WebDAV endpoint.
- Update the storage step so the user must first choose a storage method, with `WebDAV` and `Local directory` as the initial options.
- Show only the configuration controls relevant to the selected storage method, while preserving the ability to switch methods before execution.
- Require an explicit directory selection and capability validation before local-directory execution can proceed.
- Keep the existing WebDAV flow available as an alternative storage method instead of replacing it.

## Capabilities

### New Capabilities
- `local-directory-storage`: Browser-based export writes reviewed files into a user-selected local directory while preserving resolved target paths and handling browser capability or permission failures clearly.

### Modified Capabilities
- `file-export-wizard`: The storage step changes from a WebDAV-only form into a storage-method selector that conditionally renders WebDAV or local-directory setup and validation requirements.

## Impact

- Affected code: storage repository abstractions, composition root wiring, wizard state/validation, storage-step UI, execution controller/runner, and related tests under `src/domain/`, `src/data/`, and `src/webapp/`.
- Affected browser integration: File System Access API directory selection, permission handling, and streamed local file writes for supported browsers.
- User impact: users can choose between existing WebDAV export and direct local-directory export without leaving the wizard flow.
