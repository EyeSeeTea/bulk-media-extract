## 1. Storage step UX and messaging

- [x] 1.1 Redesign the wizard storage step layout so the WebDAV credential fields, test-connection action, and status feedback read as a guided setup flow rather than a minimal form.
- [x] 1.2 Add copy stating that WebDAV is the only supported target for now and include examples of compatible software such as ownCloud and Nextcloud.
- [x] 1.3 Add inline setup remarks explaining browser-to-server prerequisites, including that the WebDAV server must allow cross-origin requests from the app origin.

## 2. Validation and progression behavior

- [x] 2.1 Wire the storage-step test action to the real WebDAV validation use case or repository path instead of simulated client-side success logic.
- [x] 2.2 Ensure the storage step continues to require URL, username, and password before connection testing or progression.
- [x] 2.3 Reset any previously successful storage validation state whenever the user edits the URL, username, or password.
- [x] 2.4 Keep the next-step gate blocked until the current WebDAV credentials have passed a successful real connection test, with clear blocking feedback when they have not.
- [x] 2.5 Refine idle, loading, success, and failure messages around the real connection-validation action so retry behavior is explicit.

## 3. Verification

- [x] 3.1 Add or update wizard tests for WebDAV-only messaging, setup remarks, and blocked progression before successful validation.
- [x] 3.2 Add or update tests confirming that clicking test connection invokes the real validation path and that failed validation keeps the step blocked.
- [x] 3.3 Add or update tests confirming that editing credentials after a successful test clears the validated state and requires retesting.
- [x] 3.4 Run `yarn typecheck`, `yarn lint`, and relevant wizard tests, then fix regressions introduced by the storage-step changes.
