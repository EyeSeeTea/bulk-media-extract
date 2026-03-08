# file-export-wizard Specification

## Purpose
TBD - created by archiving change implement-wizard. Update Purpose after archive.
## Requirements
### Requirement: Wizard provides ordered export setup steps
The system SHALL provide a multi-step wizard that enforces a fixed order: scope selection, storage configuration, path/file naming template setup, preview, and execution.

#### Scenario: Wizard starts at first step
- **WHEN** the user opens the export wizard
- **THEN** the system displays the scope selection step as the first step

#### Scenario: User moves to next step after valid input
- **WHEN** the current step has all required valid values and the user clicks next
- **THEN** the wizard advances to the next configured step

### Requirement: Wizard enforces step-level validation gates
The system MUST block step transitions and final execution when required fields are missing or invalid.

#### Scenario: Missing required step data prevents transition
- **WHEN** the user attempts to continue with incomplete required fields
- **THEN** the system keeps the user on the current step and displays validation feedback for missing inputs

#### Scenario: Invalid template prevents transition
- **WHEN** the user enters an invalid mapping template and clicks next
- **THEN** the system blocks progression and shows template validation errors

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

