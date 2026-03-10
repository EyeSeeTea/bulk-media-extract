## ADDED Requirements

### Requirement: Wizard storage step supports selectable destination methods
The system SHALL present the storage step as a destination-method selection workflow instead of a fixed WebDAV-only form.  
The storage step MUST offer `WebDAV` and `Local directory` as selectable storage methods.  
The step MUST render only the setup controls and guidance relevant to the currently selected method, and it MUST allow the user to switch methods before execution.

#### Scenario: Storage step starts with method selection
- **WHEN** the user opens the storage step
- **THEN** the system displays storage-method choices for `WebDAV` and `Local directory` before the method-specific setup controls

#### Scenario: Selecting a storage method shows only relevant setup controls
- **WHEN** the user selects one storage method in the storage step
- **THEN** the system displays only that method's setup controls and guidance while hiding the inactive method's configuration form

#### Scenario: Switching storage methods does not trap the user
- **WHEN** the user changes the selected storage method after interacting with another method's setup controls
- **THEN** the system updates the visible setup panel to the newly selected method and allows the user to continue configuring that method in the same wizard session

### Requirement: Wizard storage step explains local-directory scope and browser prerequisites
The system SHALL explain the local-directory method as a browser-local export destination.  
When `Local directory` is selected, the step MUST describe that the user will choose a folder on the local computer, that browser support for the required file-system APIs is mandatory, and that the selected folder access is limited to the current browser session.

#### Scenario: Local-directory guidance appears only for the local method
- **WHEN** the user selects `Local directory` in the storage step
- **THEN** the system displays setup guidance describing local folder selection, browser support expectations, and current-session access behavior

#### Scenario: WebDAV guidance is hidden while local-directory is selected
- **WHEN** the user selects `Local directory` in the storage step
- **THEN** the system does not display WebDAV-specific setup remarks that are irrelevant to the local-directory method

### Requirement: Wizard storage step validates local-directory readiness before execution
The system MUST require local-directory validation before the wizard can advance from the storage step when `Local directory` is the selected method.  
That validation MUST confirm that the browser supports the required local file-system APIs and that the user has selected a usable destination directory for the current session.

#### Scenario: Local-directory method blocks progression until a directory is selected and validated
- **WHEN** the user attempts to continue from the storage step with `Local directory` selected before completing local-directory validation
- **THEN** the system blocks progression and instructs the user to select and validate a destination directory first

#### Scenario: Changing the selected local directory clears prior local validation
- **WHEN** the user changes or reselects the destination directory after local-directory validation succeeded
- **THEN** the system clears the prior local validated state and requires validation of the current directory before allowing progression

## MODIFIED Requirements

### Requirement: Wizard enforces step-level validation gates
The system MUST block step transitions and final execution when required fields are missing or invalid, including required file selection in step 1, required per-file mapping coverage in step 2, valid template input before preview, duplicate target filepaths in preview, and a successful validation of the currently selected storage method before execution.  
The storage step MUST require the user to select a storage method before the wizard can advance.  
When `WebDAV` is selected, the storage step MUST require the user to provide the WebDAV URL, username, and password, and MUST require a successful connection test using the currently entered values before the wizard can advance.  
When `Local directory` is selected, the storage step MUST require the user to select and validate a destination directory before the wizard can advance.

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

#### Scenario: Storage step blocks progression until current WebDAV credentials are validated
- **WHEN** the user attempts to continue from the storage step with `WebDAV` selected before a successful connection test with the currently entered WebDAV URL, username, and password
- **THEN** the system blocks progression and instructs the user to test the connection successfully before continuing

#### Scenario: Storage step blocks progression until current local directory is validated
- **WHEN** the user attempts to continue from the storage step with `Local directory` selected before a successful directory validation
- **THEN** the system blocks progression and instructs the user to validate the selected local directory before continuing

#### Scenario: Editing validated WebDAV credentials clears the progression gate
- **WHEN** the user changes the WebDAV URL, username, or password after a successful connection test
- **THEN** the system clears the prior validated state and requires a new successful connection test before allowing progression

#### Scenario: Failed real WebDAV validation prevents progression
- **WHEN** the user runs the storage-step connection test with `WebDAV` selected and the real WebDAV validation request fails
- **THEN** the system keeps the storage step blocked from progressing and displays the validation failure result

### Requirement: Wizard storage step explains WebDAV scope and setup prerequisites
The system SHALL present WebDAV setup guidance when `WebDAV` is the selected storage method.  
The step MUST show a single setup notice that combines examples of WebDAV-compatible software, such as ownCloud and Nextcloud, with concise browser-side prerequisites for successful validation and export, including that the remote service must allow cross-origin requests from the application origin.  
The step MUST avoid redundant standalone scope or completeness notices when the same guidance is already communicated by the form structure, the setup notice, and the validation state feedback.

#### Scenario: User sees one consolidated WebDAV setup notice
- **WHEN** the user opens the storage step with `WebDAV` selected
- **THEN** the system displays one setup notice that mentions WebDAV-compatible software examples and the main validation prerequisites instead of splitting that guidance across separate introductory notices

#### Scenario: User can understand WebDAV infrastructure prerequisites from the step itself
- **WHEN** the storage step is visible with `WebDAV` selected
- **THEN** the system provides explanatory remarks that help the user understand why a valid server-side WebDAV setup and cross-origin access configuration are required before the connection test can succeed

#### Scenario: Incomplete WebDAV credentials do not trigger a redundant introductory notice
- **WHEN** the user has selected `WebDAV` but has not yet entered the WebDAV URL, username, and password
- **THEN** the system keeps the connection test unavailable without showing a separate introductory notice that only repeats the need to complete those fields

### Requirement: Wizard storage test performs real WebDAV validation
The system MUST perform an actual validation request against the currently entered WebDAV endpoint when the user triggers the storage connection test with `WebDAV` selected.  
The system MUST NOT mark the WebDAV connection as valid based only on client-side field presence or URL-format checks.  
The system MUST report success only when the real validation request succeeds and MUST report failure when the request fails because of authentication, connectivity, protocol, or cross-origin access problems.

#### Scenario: Test connection issues a real WebDAV validation request
- **WHEN** the user clicks the storage-step test connection action after selecting `WebDAV` and entering URL, username, and password
- **THEN** the system sends a validation request using those current values and updates the UI from the request result

#### Scenario: Client-side checks alone cannot mark WebDAV valid
- **WHEN** the entered WebDAV values pass local field-completeness or URL-shape checks but the real WebDAV validation request fails
- **THEN** the system keeps the WebDAV method invalid and shows failure feedback instead of allowing progression
