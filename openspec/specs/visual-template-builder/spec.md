# visual-template-builder Specification

## Purpose
TBD - created by archiving change add-visual-template-builder. Update Purpose after archive.
## Requirements
### Requirement: Visual builder presents template editor and property browser together
The system SHALL render the template editor and available property catalog side by side in the template setup step so users can compose templates without leaving context.

#### Scenario: Side-by-side builder is visible
- **WHEN** the user opens the template setup step in the export wizard
- **THEN** the UI shows an editable template input and an interactive property list in a two-panel layout

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

### Requirement: Selecting a property inserts placeholder at cursor position
The system SHALL insert the selected property placeholder token at the current cursor location in the active template input.

#### Scenario: Placeholder inserted at caret
- **WHEN** the user places the cursor in the template input and clicks a property
- **THEN** the placeholder token is inserted at that cursor position without losing existing text

### Requirement: Quick preview is shown only for valid templates
The system MUST validate template syntax and show a quick preview only when the template is valid.

#### Scenario: Valid template renders preview rows
- **WHEN** the template is valid and preview context is complete
- **THEN** the UI displays resolved preview results for up to the first 10 matching events

#### Scenario: Invalid template blocks preview
- **WHEN** the template contains syntax or placeholder validation errors
- **THEN** the UI shows validation feedback and does not render preview rows

### Requirement: Template editor shows secondary token guidance below the input
The system SHALL place token usage guidance below the template textarea and render it as helper text so the editor retains more horizontal space for template authoring.

#### Scenario: Token hint appears below textarea
- **WHEN** the user views a file template editor
- **THEN** the token usage hint is rendered below the textarea rather than above the editor grid

### Requirement: Template validation feedback stays concise inside the editor column
The system SHALL keep template validation feedback within the editor column instead of expanding the layout with a full-width success notice.  
For valid templates, the editor SHALL show a concise preview label and resolved examples directly below the helper text.  
For missing or invalid templates, the editor SHALL use quiet field-level feedback rather than an additional prominent notice box.

#### Scenario: Valid template preview stays in the editor column
- **WHEN** the current template is valid
- **THEN** the editor shows a concise validation label and preview examples directly below the helper text inside the editor column

#### Scenario: Missing template uses quiet field-level feedback
- **WHEN** the current template is empty
- **THEN** the textarea is marked as invalid and the editor shows compact field-level guidance instead of a separate template error notice

