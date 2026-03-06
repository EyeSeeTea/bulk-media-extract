## 1. Setup and Generic Hooks

- [x] 1.1 Create `src/webapp/hooks/` directory structure
- [x] 1.2 Create `src/webapp/pages/landing/hooks/` directory
- [x] 1.3 Create `src/webapp/pages/landing/components/` directory
- [x] 1.4 Implement `useAsyncData` hook in `src/webapp/hooks/useAsyncData.ts` with AsyncData type and execute function
- [x] 1.5 Add tests for `useAsyncData` hook covering all states (idle, loading, success, error)
- [x] 1.6 Implement `useCachedAsyncData` hook in `src/webapp/hooks/useCachedAsyncData.ts` with cache key support
- [x] 1.7 Add tests for `useCachedAsyncData` hook covering cache hits, misses, and key changes

## 2. Domain-Specific Data Hooks

- [x] 2.1 Implement `useFileCapablePrograms` hook in `src/webapp/pages/landing/hooks/useFileCapablePrograms.ts`
- [x] 2.2 Add tests for `useFileCapablePrograms` hook
- [x] 2.3 Implement `useOrganisationUnits` hook in `src/webapp/pages/landing/hooks/useOrganisationUnits.ts`
- [x] 2.4 Add tests for `useOrganisationUnits` hook
- [x] 2.5 Implement `useProgramFileProperties` hook in `src/webapp/pages/landing/hooks/useProgramFileProperties.ts` with caching
- [x] 2.6 Add tests for `useProgramFileProperties` hook
- [x] 2.7 Implement `useProgramEventsPreview` hook in `src/webapp/pages/landing/hooks/useProgramEventsPreview.ts` with caching
- [x] 2.8 Add tests for `useProgramEventsPreview` hook

## 3. Component Creation

- [x] 3.1 Create `ProgramPicker` component in `src/webapp/pages/landing/components/ProgramPicker.tsx`
- [x] 3.2 Add tests for `ProgramPicker` component covering all states and interactions
- [x] 3.3 Create `ProgramDetails` component in `src/webapp/pages/landing/components/ProgramDetails.tsx`
- [x] 3.4 Add tests for `ProgramDetails` component covering all states
- [x] 3.5 Create `EventPreview` component in `src/webapp/pages/landing/components/EventPreview.tsx`
- [x] 3.6 Add tests for `EventPreview` component covering all states and interactions

## 4. LandingPage Refactor

- [x] 4.1 Refactor `LandingPage.tsx` to use new hooks and components (remove existing hook logic)
- [x] 4.2 Update existing `LandingPage` tests to reflect new structure
- [x] 4.3 Verify all functionality works with manual testing (program selection, details view, event preview)
- [x] 4.4 Run full test suite to ensure no regressions

## 5. Documentation and Cleanup

- [x] 5.1 Add JSDoc comments to all new hooks explaining usage
- [x] 5.2 Add JSDoc comments to all new components explaining props
- [x] 5.3 Verify code style follows project conventions (imports, naming, types)
- [x] 5.4 Run `yarn prettify` and `yarn lint` to ensure code quality
