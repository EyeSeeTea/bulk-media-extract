## MODIFIED Requirements

### Requirement: Wizard storage step explains WebDAV scope and setup prerequisites
The system SHALL present the storage step as a WebDAV configuration step.  
The step MUST show a single setup notice that combines examples of WebDAV-compatible software, such as ownCloud and Nextcloud, with concise browser-side prerequisites for successful validation and export, including that the remote service must allow cross-origin requests from the application origin.  
The step MUST avoid redundant standalone scope or completeness notices when the same guidance is already communicated by the form structure, the setup notice, and the validation state feedback.

#### Scenario: User sees one consolidated setup notice
- **WHEN** the user opens the storage step
- **THEN** the system displays one setup notice that mentions WebDAV-compatible software examples and the main validation prerequisites instead of splitting that guidance across separate introductory notices

#### Scenario: User can understand infrastructure prerequisites from the step itself
- **WHEN** the storage step is visible
- **THEN** the system provides explanatory remarks that help the user understand why a valid server-side WebDAV setup and cross-origin access configuration are required before the connection test can succeed

#### Scenario: Incomplete credentials do not trigger a redundant introductory notice
- **WHEN** the user has not yet entered the WebDAV URL, username, and password
- **THEN** the system keeps the connection test unavailable without showing a separate introductory notice that only repeats the need to complete those fields
