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
The system SHALL display an error screen if API initialization fails (e.g., base URL cannot be resolved, network failure). The error MUST NOT be swallowed silently. The error UI MUST use valid, accessible HTML — no nested heading elements.

#### Scenario: Base URL resolution fails
- **WHEN** the base URL cannot be resolved from the meta tag or manifest
- **THEN** the system displays an error message to the user

#### Scenario: API request fails during initialization
- **WHEN** a critical API request fails during background initialization
- **THEN** the system displays an error message to the user with a login link

#### Scenario: Error UI uses valid HTML
- **WHEN** an initialization error is displayed
- **THEN** the error container MUST NOT nest heading elements (e.g., no `<h3>` inside `<h3>`)

### Requirement: Manifest fallback persists resolved base URL in component state
When `getBaseUrlSync()` returns `null` (no injected meta tag, e.g., zip-file deployment), the system SHALL resolve the base URL from `manifest.webapp` and store it in React component state. The stored URL SHALL be used for both `initializeApp()` and the `<Provider>` config, preventing repeated manifest fetches.

#### Scenario: Zip-file deployment resolves base URL from manifest
- **WHEN** the app is deployed via zip file (no `<meta name="dhis2-base-url">` tag)
- **THEN** the system fetches the base URL from `manifest.webapp` exactly once, stores it in state, and uses it to initialize the app and configure the Provider

#### Scenario: No infinite loop on manifest fallback
- **WHEN** `getBaseUrlSync()` returns `null` and `BaseUrlFallback` resolves the URL
- **THEN** the `BaseUrlFallback` component MUST NOT re-fetch the manifest after the URL is resolved

### Requirement: Fallback callbacks are stable across renders
The `onResolved` and `onError` callbacks passed to `BaseUrlFallback` SHALL be memoized (e.g., via `useCallback`) so that the effect in `BaseUrlFallback` does not re-execute on every parent render.

#### Scenario: Callbacks do not trigger repeated effects
- **WHEN** `Dhis2App` re-renders while `BaseUrlFallback` is mounted
- **THEN** the `useEffect` in `BaseUrlFallback` does not re-run because callback references are stable

