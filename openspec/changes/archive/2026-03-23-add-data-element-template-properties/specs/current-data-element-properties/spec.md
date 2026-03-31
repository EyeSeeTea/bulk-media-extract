## ADDED Requirements

### Requirement: Current data element name and code are available as template properties
The system SHALL expose the current data element's name and code as template properties with tokens `{currentDataElementName}` and `{currentDataElementCode}`. These properties SHALL be grouped in a "Current Data Element" property group with sourceType `metadata`.

#### Scenario: Both properties are available when a file data element is selected
- **WHEN** the user has selected at least one file data element for export
- **THEN** the "Current Data Element" group contains `currentDataElementName` (always) and `currentDataElementCode` (when at least one selected data element has a code)

#### Scenario: Code property is hidden when no data element has a code
- **WHEN** none of the selected file data elements have a code value
- **THEN** the "Current Data Element" group contains only `currentDataElementName`

### Requirement: ProgramFileProperty entity supports an optional code attribute
The `ProgramFileProperty` entity SHALL accept an optional `code` attribute so that data element code can be carried through the property pipeline.

#### Scenario: Code attribute is populated from DHIS2 metadata
- **WHEN** the system builds file properties from a DHIS2 program whose data elements have codes
- **THEN** each `ProgramFileProperty` for those data elements includes the `code` value

#### Scenario: Code attribute is undefined when DHIS2 data element has no code
- **WHEN** a data element in the DHIS2 program does not have a code
- **THEN** the corresponding `ProgramFileProperty` has `code` as undefined
