## Purpose
Define reusable async data hooks for the landing page with consistent state handling, caching, and domain-specific data retrieval.

## Requirements

### Requirement: useAsyncData hook manages async operation states
The system SHALL provide a `useAsyncData` hook that manages the lifecycle of async operations with states: idle, loading, success, and error.

#### Scenario: Initial idle state
- **WHEN** the hook is instantiated without auto-execute
- **THEN** the state SHALL be `{ status: "idle" }`

#### Scenario: Loading state during execution
- **WHEN** an async function is executing
- **THEN** the state SHALL be `{ status: "loading" }`

#### Scenario: Success state with data
- **WHEN** an async function resolves successfully with data
- **THEN** the state SHALL be `{ status: "success", data: T }`

#### Scenario: Error state with message
- **WHEN** an async function rejects with an error
- **THEN** the state SHALL be `{ status: "error", error: string }`

#### Scenario: Manual execution trigger
- **WHEN** user calls the returned `execute` function
- **THEN** the async operation SHALL run and update state accordingly

### Requirement: useCachedAsyncData hook provides caching layer
The system SHALL provide a `useCachedAsyncData` hook that caches results based on cache keys to avoid redundant API calls.

#### Scenario: Cache hit returns cached data immediately
- **WHEN** data for a cache key already exists in cache
- **THEN** the hook SHALL return cached data without executing the async function

#### Scenario: Cache miss executes async function
- **WHEN** data for a cache key does not exist in cache
- **THEN** the hook SHALL execute the async function and store the result

#### Scenario: Cache key change triggers new fetch
- **WHEN** the cache key changes to a value not in cache
- **THEN** the hook SHALL execute the async function for the new key

#### Scenario: Empty cache key returns idle state
- **WHEN** the cache key is empty or undefined
- **THEN** the hook SHALL return `{ status: "idle" }` without executing

### Requirement: Domain-specific data fetching hooks
The system SHALL provide domain-specific hooks for each data fetching operation used by the landing page.

#### Scenario: useFileCapablePrograms hook
- **WHEN** the hook is mounted
- **THEN** it SHALL fetch file-capable programs using `GetFileCapableProgramsUseCase`

#### Scenario: useOrganisationUnits hook
- **WHEN** the hook is mounted
- **THEN** it SHALL fetch organisation units using `GetOrganisationUnitsUseCase`

#### Scenario: useProgramFileProperties hook with program ID
- **WHEN** called with a valid program ID
- **THEN** it SHALL fetch program file properties using `GetProgramFilePropertiesUseCase` with caching

#### Scenario: useProgramEventsPreview hook with program and org unit IDs
- **WHEN** called with valid program and org unit IDs
- **THEN** it SHALL fetch event preview using `GetProgramEventsPreviewUseCase` with caching
