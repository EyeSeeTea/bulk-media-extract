# file-export-wizard Specification

## Purpose
TBD - created by archiving change implement-wizard. Update Purpose after archive.
## Requirements
### Requirement: Wizard provides ordered export setup steps
The system SHALL provide a multi-step wizard that enforces a fixed order: scope selection, path/file naming template setup, preview, storage configuration, and execution.  
The path/file naming template setup step MUST expose a visual template builder with side-by-side editor and property browser.

#### Scenario: Wizard starts at first step
- **WHEN** the user opens the export wizard
- **THEN** the system displays the scope selection step as the first step

#### Scenario: User moves to next step after valid input
- **WHEN** the current step has all required valid values and the user clicks next
- **THEN** the wizard advances to the next configured step

#### Scenario: Preview step appears before storage
- **WHEN** the user completes the template setup step with valid input
- **THEN** the wizard advances to the preview step instead of the storage step

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

### Requirement: Wizard preserves in-progress configuration across step navigation
The system SHALL preserve entered values while the user navigates backward or forward between steps in the same session.

#### Scenario: Back navigation retains data
- **WHEN** the user goes back to a previous step after entering later-step values
- **THEN** previously entered values remain populated

#### Scenario: Forward navigation retains corrected data
- **WHEN** the user fixes a validation error and continues
- **THEN** corrected values are retained in subsequent steps

### Requirement: Wizard executes export through existing export workflow
The system MUST trigger export execution using the existing export use case and expose progress and failures in the wizard UI.

#### Scenario: Export starts from final step
- **WHEN** the user confirms execution on the final step with a valid configuration
- **THEN** the system starts export processing and shows progress updates

#### Scenario: Export failure is visible and recoverable
- **WHEN** export execution fails for one or more files
- **THEN** the system shows error details and allows the user to retry execution without re-entering unaffected configuration

### Requirement: Wizard preview step exposes export configuration action
The system SHALL display an export configuration action in the preview step and MUST generate a JSON execution configuration from the current reviewed preview result when the user activates it.  
The downloaded configuration MUST use the defined execution-configuration contract and MUST reflect the same reviewed preview rows and resolved targets currently visible in the preview step, excluding rows that are marked as skipped because they are missing `FileResource`.

#### Scenario: Preview shows export configuration button
- **WHEN** the user reaches the preview step
- **THEN** the system displays an export configuration button alongside the preview actions

#### Scenario: Export configuration downloads as JSON
- **WHEN** the user activates the export configuration action after the preview has loaded
- **THEN** the system downloads a JSON file containing the execution configuration for the current reviewed preview result

#### Scenario: Export configuration excludes skipped rows
- **WHEN** the current preview contains rows that are visible warnings because their `FileResource` could not be resolved
- **THEN** the downloaded execution configuration omits those rows from its operations while preserving the reviewed exportable rows and skipped-row counts

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
