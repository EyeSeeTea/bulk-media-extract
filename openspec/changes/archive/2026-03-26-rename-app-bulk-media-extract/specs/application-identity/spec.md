## MODIFIED Requirements

### Requirement: Distributed app metadata presents the product identity
The system MUST publish the file-export application under the product name `Bulk Media Extract` and the description `Bulk extract and export DHIS2 media files to external storage with metadata-driven paths.` across distributable metadata and the runtime shell.

#### Scenario: Build metadata uses the product identity
- **WHEN** maintainers inspect the app metadata sources used to build the distributable package and DHIS2 manifest
- **THEN** the package and manifest fields MUST use `Bulk Media Extract` as the app name and `Bulk extract and export DHIS2 media files to external storage with metadata-driven paths.` as the app description

#### Scenario: Runtime shell uses the product identity
- **WHEN** a user opens the app in DHIS2
- **THEN** the visible application shell MUST identify the app as `Bulk Media Extract`

#### Scenario: Landing page displays the product name
- **WHEN** a user lands on the application landing page
- **THEN** the page title MUST display `Bulk Media Extract` instead of any previous branding
