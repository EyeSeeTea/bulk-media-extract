## MODIFIED Requirements

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
The system MUST block step transitions and final execution when required fields are missing or invalid, including required file selection in step 1, required per-file mapping coverage in step 2, valid template input before preview, and duplicate target filepaths in preview.

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

## ADDED Requirements

### Requirement: Wizard preview step exposes export configuration action
The system SHALL display an export configuration action in the preview step so the workflow can later support running exports from a saved configuration.  
This change MUST expose the action without generating a configuration file yet.

#### Scenario: Preview shows export configuration button
- **WHEN** the user reaches the preview step
- **THEN** the system displays an export configuration button alongside the preview actions

#### Scenario: Export configuration generation is not yet available
- **WHEN** the user activates the export configuration button
- **THEN** the system does not generate a configuration file and instead communicates that the action will be implemented in a future change
