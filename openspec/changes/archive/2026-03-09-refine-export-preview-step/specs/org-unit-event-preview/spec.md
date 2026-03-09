## ADDED Requirements

### Requirement: Preview summarizes export scope before org unit mode
The system SHALL present the selected export scope above the preview results in the following order: program, each selected file data element paired with its template, org unit name, and then org unit mode.
The summary SHALL use a compact layout that can place multiple summary items on the same row when horizontal space is available.
The org unit label in that summary MUST display the org unit name rather than the raw org unit id.

#### Scenario: Preview summary shows selected context in required order
- **WHEN** the user opens the preview step with a selected program, file mappings, and org unit
- **THEN** the preview summary lists the selected program first, each selected file data element with its template second, the org unit name third, and org unit mode after those items

### Requirement: Preview reports files skipped for missing FileResource
The system SHALL display an aggregate warning message when one or more preview rows are missing resolved file-resource metadata needed for export.  
The warning MUST state how many files without `FileResource` will not be exported.
Preview file totals MUST exclude rows that will be skipped for missing `FileResource`.

#### Scenario: Preview warns about skipped files
- **WHEN** one or more preview rows are missing a `FileResource`
- **THEN** the preview displays a warning message stating the number of files that will not be exported because their `FileResource` is missing

#### Scenario: Preview file totals exclude skipped rows
- **WHEN** the preview contains both exportable rows and rows missing `FileResource`
- **THEN** the `Files` total counts only the exportable rows and excludes the rows that will be skipped

## MODIFIED Requirements

### Requirement: Preview highlights file-related values
The system SHALL include file-related values for each previewed export row, including rows whose selected file data value is missing a `FileResource`.  
The preview table MUST include only the columns `Event`, `File data value`, `source filename`, `size`, and `target`.  
The `Event` column MUST link to the event in the Capture app.  
The `Event` link MUST use the event's org unit context and appear with visual link styling.  
The `Event` link MUST use the Capture route format `#/enrollmentEventEdit?eventId=...&orgUnitId=...`, with a dynamic base URL.  
Rows missing a `FileResource` MUST be highlighted as warnings.  
The matching-events summary, aggregate file statistics, and export-configuration action MUST be rendered below the preview table.
The preview table MUST use the available content width.

#### Scenario: Preview row contains exportable file value
- **WHEN** a previewed export row corresponds to an available file with a `FileResource`
- **THEN** the preview displays the row in the configured columns, renders the `Event` value as a styled link to the Capture app, and uses the event's org unit in that link

#### Scenario: Preview row is missing FileResource
- **WHEN** a previewed export row corresponds to a selected file data value whose file-resource metadata cannot be resolved
- **THEN** the preview keeps the row visible, highlights it as a warning, avoids presenting the raw file resource id as a filename, and indicates unavailable file export details in the remaining columns as needed
