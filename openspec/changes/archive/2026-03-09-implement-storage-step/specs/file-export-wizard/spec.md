## ADDED Requirements

### Requirement: Wizard storage step explains WebDAV scope and setup prerequisites
The system SHALL present the storage step as a WebDAV-specific configuration step and MUST clearly state that WebDAV is the only supported export target in this release.  
The step MUST include examples of compatible software, such as ownCloud and Nextcloud, and MUST include concise remarks about browser-side prerequisites for successful validation and export, including that the remote service must be configured to allow cross-origin requests from the application origin.

#### Scenario: User sees WebDAV-only guidance before testing credentials
- **WHEN** the user opens the storage step
- **THEN** the system displays messaging that WebDAV is the only supported target for now, includes examples of WebDAV-compatible software, and shows configuration remarks about browser access and CORS requirements

#### Scenario: User can understand infrastructure prerequisites from the step itself
- **WHEN** the storage step is visible
- **THEN** the system provides explanatory remarks that help the user understand why a valid server-side WebDAV setup and cross-origin access configuration are required before the connection test can succeed

### Requirement: Wizard storage test performs real WebDAV validation
The system MUST perform an actual validation request against the currently entered WebDAV endpoint when the user triggers the storage connection test.  
The system MUST NOT mark the connection as valid based only on client-side field presence or URL-format checks.  
The system MUST report success only when the real validation request succeeds and MUST report failure when the request fails because of authentication, connectivity, protocol, or cross-origin access problems.

#### Scenario: Test connection issues a real validation request
- **WHEN** the user clicks the storage-step test connection action after entering URL, username, and password
- **THEN** the system sends a validation request using those current values and updates the UI from the request result

#### Scenario: Client-side checks alone cannot mark the connection valid
- **WHEN** the entered values pass local field-completeness or URL-shape checks but the real WebDAV validation request fails
- **THEN** the system keeps the connection invalid and shows failure feedback instead of allowing progression

## MODIFIED Requirements

### Requirement: Wizard enforces step-level validation gates
The system MUST block step transitions and final execution when required fields are missing or invalid, including required file selection in step 1, required per-file mapping coverage in step 2, valid template input before preview, duplicate target filepaths in preview, and a successful storage connection validation before execution.  
The storage step MUST require the user to provide the WebDAV URL, username, and password, and MUST require a successful connection test using the currently entered values before the wizard can advance.

#### Scenario: Missing required step data prevents transition
- **WHEN** the user attempts to continue with incomplete required fields
- **THEN** the system keeps the user on the current step and displays validation feedback for missing inputs

#### Scenario: No files selected in step 1 prevents transition
- **WHEN** the user attempts to continue from step 1 without selecting any file dataValue to sync
- **THEN** the system blocks progression and shows a validation error indicating at least one file must be selected

#### Scenario: Missing file mappings in step 2 prevents transition
- **WHEN** the user attempts to continue from step 2 and one or more selected files do not have a mapping
- **THEN** the system blocks progression and shows validation feedback for each selected file missing a mapping

#### Scenario: Invalid template prevents transition
- **WHEN** the user enters an invalid mapping template and clicks next
- **THEN** the system blocks progression and shows template validation errors

#### Scenario: Duplicate preview target filepath prevents transition
- **WHEN** the preview step contains two or more files with the same resolved target filepath and the user clicks next
- **THEN** the system blocks progression, highlights the duplicate conflict, and instructs the user to revise the template

#### Scenario: Storage step blocks progression until current credentials are validated
- **WHEN** the user attempts to continue from the storage step before a successful connection test with the currently entered WebDAV URL, username, and password
- **THEN** the system blocks progression and instructs the user to test the connection successfully before continuing

#### Scenario: Editing validated credentials clears the progression gate
- **WHEN** the user changes the WebDAV URL, username, or password after a successful connection test
- **THEN** the system clears the prior validated state and requires a new successful connection test before allowing progression

#### Scenario: Failed real validation prevents progression
- **WHEN** the user runs the storage-step connection test and the real WebDAV validation request fails
- **THEN** the system keeps the storage step blocked from progressing and displays the validation failure result
