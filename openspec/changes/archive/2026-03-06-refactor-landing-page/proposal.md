## Why

The LandingPage component violates Clean Architecture principles by mixing business logic, state management, caching, and UI rendering in a single 289-line file. This makes the code hard to test, maintain, and reuse. Following the project's frontend best practices requires extracting hooks and splitting into composable components.

## What Changes

- Extract custom hooks for data fetching (`useFileCapablePrograms`, `useOrganisationUnits`, `useProgramFileProperties`, `useProgramEventsPreview`)
- Create a reusable async state management hook (`useAsyncData`)
- Extract caching logic into a dedicated hook (`useCachedAsyncData`)
- Split UI into smaller, focused components:
  - `ProgramPicker`: Program selection dropdown with reload
  - `ProgramDetails`: Display program file properties
  - `EventPreview`: Org unit selection and event table
- Keep LandingPage as a thin orchestration layer with minimal logic

## Capabilities

### New Capabilities
- `async-data-hooks`: Custom hooks for managing async data states (loading, success, error) with caching support
- `landing-page-components`: Composable UI components for program selection, details display, and event preview

### Modified Capabilities
<!-- No existing capabilities are having their requirements changed -->

## Impact

- **Components**: [LandingPage.tsx](src/webapp/pages/landing/LandingPage.tsx) will be refactored into multiple files
- **New files**: Custom hooks in `src/webapp/hooks/`, child components in `src/webapp/pages/landing/components/`
- **Tests**: New tests for hooks and components, update existing LandingPage tests
- **No breaking changes**: External API and user experience remain unchanged
