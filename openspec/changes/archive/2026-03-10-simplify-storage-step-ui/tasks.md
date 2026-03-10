## 1. Storage Step Copy Simplification

- [x] 1.1 Remove the standalone WebDAV-only subtitle from the Storage step.
- [x] 1.2 Replace the separate `Compatible software` and `Before you test` sections with one consolidated setup notice.
- [x] 1.3 Remove the `Complete the connection details` notice while keeping the disabled test action and existing validation flow intact.

## 2. Verification

- [x] 2.1 Update `WizardPage` Storage-step tests to assert the new consolidated guidance content.
- [x] 2.2 Update tests to assert that the removed notices are no longer rendered.
- [x] 2.3 Run the relevant wizard test suite and fix any regressions caused by the copy and structure changes.
