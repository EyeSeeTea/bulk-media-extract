## MODIFIED Requirements

### Requirement: Property catalog is grouped by program type and metadata source
The system MUST organize selectable properties according to the selected program type and separate file metadata, organisation unit properties, event properties, current data element properties, and data element groups into distinct groups.
The file metadata group MUST appear first and include filename plus any additional file metadata fields provided by DHIS2 for the selected file context, including file extension when the filename can be resolved.
The organisation unit group MUST include standard organisation unit placeholders and any available custom organisation unit attributes for the selected program scope.
The event group MUST contain enrollment/event placeholders that can be resolved consistently for the selected program type.
The current data element group MUST appear after the event group and include the current data element name and, when available, code.

#### Scenario: Tracker program property groups are shown in template-oriented order
- **WHEN** the selected program is a tracker program
- **THEN** the property catalog lists file metadata first, followed by organisation unit properties, event properties, current data element properties, tracked entity attributes, and program stage data element groups

#### Scenario: Event program property groups are shown in template-oriented order
- **WHEN** the selected program is an event program
- **THEN** the property catalog lists file metadata first, followed by organisation unit properties, event properties, current data element properties, and event data element groups

#### Scenario: File metadata placeholder availability is capability-driven
- **WHEN** DHIS2 does not provide a specific file metadata field for the selected file context
- **THEN** that placeholder is not listed while still listing filename and other available file metadata placeholders

#### Scenario: Organisation unit custom attributes appear only when available
- **WHEN** the selected program scope includes organisation units with custom attributes
- **THEN** the property catalog lists those attributes in the organisation unit section using dedicated organisation unit attribute tokens
