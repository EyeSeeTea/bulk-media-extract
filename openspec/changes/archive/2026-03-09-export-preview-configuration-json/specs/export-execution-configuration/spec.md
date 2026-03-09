## ADDED Requirements

### Requirement: Execution configuration captures the reviewed export scope
The system SHALL define a versioned JSON execution configuration document that represents the reviewed export plan from the preview step.  
The document MUST include a schema version, generation timestamp, and summary context for the reviewed scope, including the selected program, selected organisation unit, organisation-unit mode, selected file mappings, total preview rows, total exportable operations, and total skipped rows missing `FileResource`.

#### Scenario: Configuration records reviewed scope metadata
- **WHEN** the system generates an execution configuration from the preview step
- **THEN** the resulting JSON document includes versioning and summary fields describing the reviewed export scope and preview totals

### Requirement: Execution configuration contains one operation per exportable preview row
The system MUST serialize exactly one operation for each preview row that is exportable and MUST exclude preview rows whose selected file data value is missing resolved `FileResource` metadata.  
The exported operation count MUST match the number of exportable rows shown in preview.

#### Scenario: Configuration excludes skipped preview rows
- **WHEN** the preview contains both exportable rows and warning rows missing `FileResource`
- **THEN** the execution configuration includes operations only for the exportable rows and records the skipped-row count in the document summary

### Requirement: Execution configuration operations keep `source` and `target` with a minimal source payload
Each execution configuration operation MUST include both `source` and `target` objects.  
The `source` object MUST include only `url`, `fileResourceId`, and `fileSize`.  
The `target` object MUST include the resolved destination `path` reviewed in preview.  
The `source.url` field MUST use the format `{baseUrl}/api/41/tracker/events/{eventId}/dataValues/{dataElementId}/file`, using the application's existing provider `baseUrl`.

#### Scenario: Configuration operation contains the agreed source and target data
- **WHEN** an exportable preview row is serialized into the execution configuration
- **THEN** the resulting operation contains `source.url`, `source.fileResourceId`, `source.fileSize`, and `target.path`, using the required tracker file URL format for `source.url`
