## MODIFIED Requirements

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
