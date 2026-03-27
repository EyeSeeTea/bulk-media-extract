## MODIFIED Requirements

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

## ADDED Requirements

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
