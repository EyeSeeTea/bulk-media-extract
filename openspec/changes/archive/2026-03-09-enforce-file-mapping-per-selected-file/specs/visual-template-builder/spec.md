## MODIFIED Requirements

### Requirement: Property catalog is grouped by program type and metadata source
The system MUST organize selectable properties according to the selected program type and include a file metadata property group for mapping selected file dataValues.  
The file metadata group MUST include filename and any additional file metadata fields provided by DHIS2 for the selected file context.

#### Scenario: Tracker program property groups are shown
- **WHEN** the selected program is a tracker program
- **THEN** the property catalog includes tracked entity section data, program stage data element groups, core metadata placeholders, and available file metadata placeholders

#### Scenario: Event program property groups are shown
- **WHEN** the selected program is an event program
- **THEN** the property catalog includes event data elements, core metadata placeholders, and available file metadata placeholders

#### Scenario: File metadata placeholder availability is capability-driven
- **WHEN** DHIS2 does not provide a specific file metadata field for the selected file context
- **THEN** that placeholder is not listed while still listing filename and other available file metadata placeholders
