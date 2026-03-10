## MODIFIED Requirements

### Requirement: Wizard preview step exposes export configuration action
The system SHALL display an export configuration action in the preview step and MUST generate a JSON execution configuration from the current reviewed preview result when the user activates it.  
The downloaded configuration MUST use the defined execution-configuration contract and MUST reflect the same reviewed preview rows and resolved targets currently visible in the preview step, excluding rows that are marked as skipped because they are missing `FileResource`.  
Each exported operation's source URL MUST match the upstream-file endpoint for the detected DHIS2 version so the saved execution plan remains runnable against the same server version that produced the preview.

#### Scenario: Preview shows export configuration button
- **WHEN** the user reaches the preview step
- **THEN** the system displays an export configuration button alongside the preview actions

#### Scenario: Export configuration downloads as JSON
- **WHEN** the user activates the export configuration action after the preview has loaded
- **THEN** the system downloads a JSON file containing the execution configuration for the current reviewed preview result

#### Scenario: Export configuration excludes skipped rows
- **WHEN** the current preview contains rows that are visible warnings because their `FileResource` could not be resolved
- **THEN** the downloaded execution configuration omits those rows from its operations while preserving the reviewed exportable rows and skipped-row counts

#### Scenario: Export configuration preserves DHIS2 2.40 source URLs
- **WHEN** the current preview was generated against a DHIS2 2.40 server
- **THEN** each exported operation references the legacy `api/40/events/files` source URL for its row instead of the 2.41 Tracker file route
