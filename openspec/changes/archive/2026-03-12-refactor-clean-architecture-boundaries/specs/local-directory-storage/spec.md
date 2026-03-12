## MODIFIED Requirements

### Requirement: Local directory export validates browser capability and directory access before execution
The system MUST validate local-directory readiness before execution begins. Validation MUST include support for the required browser file-system APIs, explicit selection of a destination directory by the user, and the ability to obtain permission to create files in that directory for the current session. The validation logic MUST be implemented in a dedicated infrastructure adapter or repository and consumed through the application execution flow rather than from a page-local helper.

#### Scenario: Supported browser and granted directory access allow execution readiness
- **WHEN** the user's browser supports the required local file-system APIs and the user selects a directory with usable write access
- **THEN** the system marks the local-directory storage method as ready for execution

#### Scenario: Unsupported browser blocks local-directory readiness
- **WHEN** the user selects the `local-directory` storage method in a browser that does not support the required local file-system APIs
- **THEN** the system keeps the method unavailable for execution and displays feedback explaining that local-directory export is not supported in that browser

#### Scenario: Missing or denied directory access blocks execution
- **WHEN** the user has not selected a destination directory or the browser denies the requested directory access
- **THEN** the system keeps the local-directory storage method invalid for execution and displays feedback describing the missing selection or permission failure

### Requirement: Local directory export reports per-file failures without losing completed writes
The system MUST preserve the existing per-file execution reporting model when writing to a local directory. Failures to create a subdirectory, open a writable file, or write file content MUST be reported against the affected operation while preserving already completed files in the selected directory. The application execution flow MUST treat the local-directory writer as an interchangeable storage-side collaborator so this reporting behavior stays consistent with other storage methods.

#### Scenario: One failed file does not erase completed local writes
- **WHEN** execution to a local directory succeeds for some operations and then fails for a later operation
- **THEN** the system reports the later operation as failed while leaving the already written local files in place and preserving the partial execution summary

#### Scenario: Local directory writer follows the shared execution contract
- **WHEN** the execution workflow switches between WebDAV and local-directory destinations
- **THEN** both destinations participate through the same application execution contract so the wizard does not need destination-specific reporting logic
