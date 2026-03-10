## ADDED Requirements

### Requirement: Distributed app metadata presents the product identity
The system MUST publish the file-export application under the product name `Tracker File Bridge` and the description `Export DHIS2 Tracker files to external storage with metadata-driven paths.` across distributable metadata and the runtime shell.

#### Scenario: Build metadata uses the product identity
- **WHEN** maintainers inspect the app metadata sources used to build the distributable package and DHIS2 manifest
- **THEN** the package and manifest fields MUST use `Tracker File Bridge` as the app name and `Export DHIS2 Tracker files to external storage with metadata-driven paths.` as the app description instead of skeleton branding

#### Scenario: Runtime shell uses the product identity
- **WHEN** a user opens the app in DHIS2
- **THEN** the visible application shell MUST identify the app as `Tracker File Bridge`

### Requirement: Application shell exposes only supported entrypoints
The system MUST remove the bootstrap example entrypoint from the shipped router and keep the supported file-export flow as the default application experience.

#### Scenario: Unsupported skeleton route is removed
- **WHEN** maintainers inspect the application router
- **THEN** the router MUST NOT define the bootstrap route `"/for/:name?"` or import its example page implementation

#### Scenario: Default route stays on the file-export flow
- **WHEN** a user opens the app without a specific route
- **THEN** the application MUST render the supported file-export experience instead of an example or placeholder page
