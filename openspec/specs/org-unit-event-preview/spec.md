# org-unit-event-preview Specification

## Purpose
TBD - created by archiving change add-file-aware-program-picker-preview. Update Purpose after archive.
## Requirements
### Requirement: Event preview requires program and org unit context
The system SHALL display a hierarchical `OrganisationUnitTree` for org unit selection in event preview, with selectable nodes restricted to the org units registered for the currently selected program.

#### Scenario: Org unit tree renders with program-specific roots
- **WHEN** a program is selected and its org units are available
- **THEN** the tree is rooted at the program's org units, preventing selection of unrelated org units

#### Scenario: Preview blocked until required selections exist
- **WHEN** either program or organisation unit is missing
- **THEN** the preview area remains disabled and explains required selections

#### Scenario: Preview query succeeds
- **WHEN** the user selects an organisation unit from the tree after selecting a program
- **THEN** the system displays a limited sample of matching events with core context fields

#### Scenario: No events match selection
- **WHEN** preview query returns no matching events
- **THEN** the UI displays a no-results state for the current selection

### Requirement: Preview returns limited sample events
The system MUST fetch and display the full set of exportable files for the selected scope and selected file mappings once a valid template is provided, rather than a bounded sample of events.  
When a valid template is provided, the preview MUST include each file's resolved target filepath.

#### Scenario: Preview query succeeds
- **WHEN** the user reaches the preview step with a valid scope, selected files, and a valid template
- **THEN** the system displays every matching file prepared for export with its resolved target filepath

#### Scenario: No files match selection
- **WHEN** preview query returns no matching exportable files
- **THEN** the UI displays a no-results state for the current selection

### Requirement: Preview highlights file-related values
The system SHALL include file-related values for each previewed export row, including rows whose selected file data value is missing a `FileResource`.  
The preview table MUST include only the columns `Event`, `File data value`, `source filename`, `size`, and `target`.  
The `Event` column MUST link to the event in the Capture app.  
The `Event` link MUST use the event's org unit context and appear with visual link styling.  
The `Event` link MUST use the Capture route format `#/enrollmentEventEdit?eventId=...&orgUnitId=...`, with a dynamic base URL.  
Exportable preview rows MUST expose a direct link to the original upstream file from within the `source filename` cell.  
The original-file link MUST use the detected DHIS2 version to choose the correct upstream file endpoint, including the legacy `api/40/events/files?dataElementUid=...&eventUid=...` route for DHIS2 2.40 and the Tracker file route for DHIS2 2.41+.  
Rows missing a `FileResource` MUST be highlighted as warnings.  
The matching-events summary, aggregate file statistics, and export-configuration action MUST be rendered below the preview table.
The preview table MUST use the available content width.

#### Scenario: Preview row contains exportable file value
- **WHEN** a previewed export row corresponds to an available file with a `FileResource`
- **THEN** the preview displays the row in the configured columns, renders the `Event` value as a styled link to the Capture app, uses the event's org unit in that link, and exposes an original-file link from the source filename cell

#### Scenario: Preview row uses the DHIS2 2.40 source-file route
- **WHEN** the connected upstream DHIS2 version is 2.40 and a previewed row has an exportable file
- **THEN** the original-file link targets `api/40/events/files` with the row's `dataElementUid` and `eventUid` query parameters

#### Scenario: Preview row is missing FileResource
- **WHEN** a previewed export row corresponds to a selected file data value whose file-resource metadata cannot be resolved
- **THEN** the preview keeps the row visible, highlights it as a warning, avoids presenting the raw file resource id as a filename, indicates unavailable file export details in the remaining columns as needed, and does not render a broken original-file link

### Requirement: Preview failures are recoverable
The system SHALL provide clear error feedback and retry for failed preview requests.

#### Scenario: Preview request fails
- **WHEN** the event preview request returns an error
- **THEN** the UI shows an error state with retry option while preserving current selections

### Requirement: Preview reports export totals and duplicate target paths
The system MUST compute aggregate preview statistics and identify duplicate resolved target filepaths before export can continue.  
The aggregate statistics MUST include total number of files and total size of files in the preview result.
Preview file totals MUST exclude rows that will be skipped for missing `FileResource`.

#### Scenario: Preview displays totals for valid results
- **WHEN** the preview resolves one or more exportable files
- **THEN** the system displays the total file count and the summed file size for the current preview result

#### Scenario: Preview file totals exclude skipped rows
- **WHEN** the preview contains both exportable rows and rows missing `FileResource`
- **THEN** the `Files` total counts only the exportable rows and excludes the rows that will be skipped

#### Scenario: Preview flags duplicate target filepath
- **WHEN** two or more preview rows resolve to the same target filepath
- **THEN** the system marks the conflicting rows and exposes a duplicate-path error for the current preview result

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
