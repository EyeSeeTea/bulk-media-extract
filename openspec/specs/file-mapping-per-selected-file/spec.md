# file-mapping-per-selected-file Specification

## Purpose
TBD - created by archiving change enforce-file-mapping-per-selected-file. Update Purpose after archive.
## Requirements
### Requirement: Selected files require explicit mapping coverage
The system MUST maintain a one-to-one mapping assignment set for all file dataValues selected for synchronization, and export execution SHALL only be allowed when all selected files have a mapping.

#### Scenario: Complete mapping set allows continuation
- **WHEN** the user has selected one or more file dataValues and each selected file has a mapping assignment
- **THEN** the wizard treats the mapping configuration as complete and allows progression to the next step

#### Scenario: Missing mapping blocks continuation
- **WHEN** at least one selected file dataValue has no mapping assignment
- **THEN** the wizard blocks progression and highlights which file entries are missing mappings

### Requirement: Mapping assignments stay aligned with selected files
The system SHALL keep mapping assignments synchronized with the current selected file set so removed files do not keep stale mappings and unchanged files preserve existing mappings.

#### Scenario: Deselected file mapping is removed
- **WHEN** the user returns to file selection and removes a previously selected file dataValue
- **THEN** the system removes that file mapping assignment from the active configuration

#### Scenario: Unchanged file mapping is preserved
- **WHEN** the user navigates between steps without changing a selected file dataValue key
- **THEN** the system preserves the existing mapping assignment for that file

