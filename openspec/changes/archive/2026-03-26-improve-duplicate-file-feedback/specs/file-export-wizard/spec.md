## MODIFIED Requirements

### Requirement: Wizard enforces step-level validation gates
The system MUST block step transitions and final execution when required fields are missing or invalid, including required file selection in step 1, required per-file mapping coverage in step 2, valid template input before preview, duplicate target filepaths in preview, and a successful validation of the currently selected storage method before execution.
The storage step MUST require the user to select a storage method before the wizard can advance.
When `WebDAV` is selected, the storage step MUST require the user to provide the WebDAV URL, username, and password, and MUST require a successful connection test using the currently entered values before the wizard can advance.
When `Local directory` is selected, the storage step MUST require the user to select and validate a destination directory before the wizard can advance.

#### Scenario: Duplicate preview target filepath prevents transition
- **WHEN** the preview step contains two or more files with the same resolved target filepath and the user clicks next
- **THEN** the system blocks progression, highlights **all** rows that share each duplicate target path, and displays a warning notice that lists each conflicting path together with the event IDs and file data element names that produce it

#### Scenario: All duplicate rows are highlighted not just one
- **WHEN** two or more preview rows resolve to the same target filepath
- **THEN** every row sharing that duplicate path SHALL be visually highlighted with the duplicate warning style

#### Scenario: Duplicate warning notice lists conflicting paths with sources
- **WHEN** the preview step detects duplicate target filepaths
- **THEN** the warning notice SHALL display each conflicting target path and, for each path, list the event ID and file data element name of every row that produces it

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
