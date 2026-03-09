## MODIFIED Requirements

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
The system SHALL include file-related values for each previewed export row when available, including the source filename and file size metadata needed for export review.

#### Scenario: Preview row contains file value
- **WHEN** a previewed export row corresponds to an available file
- **THEN** the preview output includes the file-related value reference together with its filename and available size metadata

## ADDED Requirements

### Requirement: Preview reports export totals and duplicate target paths
The system MUST compute aggregate preview statistics and identify duplicate resolved target filepaths before export can continue.  
The aggregate statistics MUST include total number of files and total size of files in the preview result.

#### Scenario: Preview displays totals for valid results
- **WHEN** the preview resolves one or more exportable files
- **THEN** the system displays the total file count and the summed file size for the current preview result

#### Scenario: Preview flags duplicate target filepath
- **WHEN** two or more preview rows resolve to the same target filepath
- **THEN** the system marks the conflicting rows and exposes a duplicate-path error for the current preview result
