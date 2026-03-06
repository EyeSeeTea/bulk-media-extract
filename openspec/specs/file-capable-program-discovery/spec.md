# file-capable-program-discovery Specification

## Purpose
TBD - created by archiving change add-file-aware-program-picker-preview. Update Purpose after archive.
## Requirements
### Requirement: File-capable programs are discoverable
The system SHALL present a program picker containing only DHIS2 programs that expose at least one file-type value source supported by the integration.

#### Scenario: Program list includes only eligible programs
- **WHEN** the user opens the program picker
- **THEN** the system returns and displays only programs with at least one file-type source

#### Scenario: Program list excludes ineligible programs
- **WHEN** a DHIS2 program contains no file-type value sources
- **THEN** the program is excluded from the picker results

### Requirement: Discovery covers supported metadata source types
The system MUST evaluate file-type sources across all supported program-linked metadata types, including event data elements and tracked entity attributes.

#### Scenario: File event data element qualifies a program
- **WHEN** a program stage contains a data element with file value type
- **THEN** the associated program is included in picker results

#### Scenario: File tracked entity attribute qualifies a program
- **WHEN** a program references a tracked entity attribute with file value type
- **THEN** the associated program is included in picker results

### Requirement: Discovery failures are actionable
The system SHALL expose user-visible failure state and technical error detail pathways when program discovery cannot be completed.

#### Scenario: Metadata request fails
- **WHEN** the metadata repository returns an error during discovery
- **THEN** the UI shows a recoverable error state and allows retry

