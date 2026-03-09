## 1. Execution configuration contract

- [x] 1.1 Define a versioned TypeScript shape for the execution configuration document, including scope summary fields and the minimal per-operation payload.
- [x] 1.2 Add a mapper that converts the current preview result into execution-configuration operations while excluding rows missing resolved `FileResource`.
- [x] 1.3 Add document-level summary fields for total preview rows, exportable operation count, and skipped missing-`FileResource` count.

## 2. Preview-step export action

- [x] 2.1 Replace the preview-step placeholder export-configuration handler with real JSON generation from the reviewed preview state.
- [x] 2.2 Implement browser download of the generated configuration as a `.json` file with a deterministic, traceable filename.
- [x] 2.3 Update preview-step copy and action states so the exported file is clearly presented as an execution configuration derived from the current preview.

## 3. Preview data support

- [x] 3.1 Ensure the preview row model exposes the inputs required by the execution-configuration contract, including the tracker file URL inputs and available file metadata.
- [x] 3.2 Keep the export-configuration generation aligned with the preview’s existing skipped-row behavior so missing-`FileResource` warnings remain visible in UI but excluded from exported operations.

## 4. Verification

- [x] 4.1 Add or update unit tests for execution-configuration mapping, including exportable rows, skipped rows, and summary counts.
- [x] 4.2 Add or update preview-step tests covering JSON download behavior and ensuring the exported operations match the reviewed preview result.
- [x] 4.3 Run relevant test suites, typecheck, and lint; fix any regressions caused by the new export-configuration flow.
