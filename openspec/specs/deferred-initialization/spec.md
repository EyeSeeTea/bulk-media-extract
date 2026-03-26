# deferred-initialization Specification

## Purpose
TBD - created by archiving change improve-initial-load. Update Purpose after archive.
## Requirements
### Requirement: App shell renders before API initialization completes
The system SHALL render the DHIS2 HeaderBar and route content immediately on app start, without waiting for API requests (user settings, system info, current user) to complete. API initialization SHALL proceed in the background.

#### Scenario: App starts and shows shell instantly
- **WHEN** the app is loaded in the browser
- **THEN** the DHIS2 HeaderBar with app name "Bulk Media Extract" is visible before any API request completes

#### Scenario: Background initialization completes
- **WHEN** API requests for user settings, DHIS2 version, and current user finish
- **THEN** the AppContext is populated and data-dependent features become available without a full page reload

### Requirement: Data-dependent routes show a loading indicator while initializing
The system SHALL display a centered DHIS2 `CircularLoader` on routes that require AppContext (e.g., `/wizard`) if initialization has not yet completed. The system SHALL NOT show unstyled text or a blank screen.

#### Scenario: User navigates to wizard before init completes
- **WHEN** the user navigates to `/wizard` while API initialization is still in progress
- **THEN** the system displays a centered `CircularLoader` on screen with the HeaderBar still visible

#### Scenario: Wizard renders after init completes
- **WHEN** API initialization completes while the user is on a data-dependent route
- **THEN** the loading indicator is replaced by the full route content

### Requirement: Initialization errors are displayed to the user
The system SHALL display an error screen if API initialization fails (e.g., base URL cannot be resolved, network failure). The error MUST NOT be swallowed silently.

#### Scenario: Base URL resolution fails
- **WHEN** the base URL cannot be resolved from the meta tag or manifest
- **THEN** the system displays an error message to the user

#### Scenario: API request fails during initialization
- **WHEN** a critical API request fails during background initialization
- **THEN** the system displays an error message to the user

