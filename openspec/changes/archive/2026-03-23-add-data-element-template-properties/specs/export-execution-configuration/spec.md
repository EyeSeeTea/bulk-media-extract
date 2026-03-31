## MODIFIED Requirements

### Requirement: Execution configuration operations keep `source` and `target` with a minimal source payload
Each execution configuration operation MUST include both `source` and `target` objects.
The `source` object MUST include only `url`, `fileResourceId`, and `fileSize`.
The `target` object MUST include the resolved destination `path` reviewed in preview.
The `source.url` field MUST use the format `{baseUrl}/api/41/tracker/events/{eventId}/dataValues/{dataElementId}/file`, using the application's existing provider `baseUrl`.
Template resolution for the `target.path` MUST support `{currentDataElementName}` and `{currentDataElementCode}` tokens, resolving them from the current file data element's name and code respectively.

#### Scenario: Configuration operation contains the agreed source and target data
- **WHEN** an exportable preview row is serialized into the execution configuration
- **THEN** the resulting operation contains `source.url`, `source.fileResourceId`, `source.fileSize`, and `target.path`, using the required tracker file URL format for `source.url`

#### Scenario: Target path resolves current data element tokens
- **WHEN** a template uses `{currentDataElementName}` or `{currentDataElementCode}` tokens
- **THEN** the resolved `target.path` contains the name or code of the data element associated with the file being exported
