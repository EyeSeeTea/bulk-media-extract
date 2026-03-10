## Why

The Storage step currently splits its setup guidance across multiple notices and repeats information that does not help the user complete the task. This change is needed now to reduce noise in the step, keep the focus on entering credentials and testing the connection, and present the important setup caveats in one place.

## What Changes

- Remove the standalone `WebDAV is the only available export target for now.` message from the Storage step.
- Replace the separate `Compatible software` and `Before you test` blocks with a single setup notice that combines WebDAV-compatible examples and practical browser/server prerequisites.
- Remove the `Complete the connection details` notice and rely on the existing disabled test action, field labels, and validation/status feedback instead.
- Preserve the existing WebDAV credential fields, connection-test flow, and progression gate before execution.

## Capabilities

### New Capabilities

### Modified Capabilities

- `file-export-wizard`: Refine the Storage-step guidance requirements so setup information is consolidated into a single notice and redundant notices are removed.

## Impact

- Affected code: `src/webapp/pages/wizard/WizardPage.tsx` and the Storage-step rendering tests in `src/webapp/pages/wizard/WizardPage.spec.tsx`.
- No domain, repository, or use-case contracts change; this is a wizard UI and copy refinement.
- Test impact: assertions for Storage-step notices and guidance copy will need updates.
