## 1. Domain and repository contracts

- [x] 1.1 Add file-capable discovery, property inspection, and event preview methods to the relevant domain repository interfaces.
- [x] 1.2 Implement `GetFileCapableProgramsUseCase` returning programs with at least one file-type source.
- [x] 1.3 Implement `GetProgramFilePropertiesUseCase` returning normalized file property descriptors and program type.
- [x] 1.4 Implement `GetProgramEventsPreviewUseCase` returning bounded org-unit scoped preview events with file-related values.

## 2. DHIS2 data layer implementation

- [x] 2.1 Extend DHIS2 repository implementations to query metadata required for file-capable program discovery.
- [x] 2.2 Add metadata mapping logic that normalizes event data element and tracked entity attribute file sources.
- [x] 2.3 Implement preview query logic for selected program + org unit with explicit result limit and error mapping.
- [x] 2.4 Add unit tests for repository mapping and error handling across discovery, inspection, and preview flows.

## 3. Composition root and application wiring

- [x] 3.1 Register the new use cases in `CompositionRoot` for webapp and test composition roots.
- [x] 3.2 Update any required context/provider contracts so the UI can consume the new use cases cleanly.

## 4. Webapp UI for picker, inspection, and preview

- [x] 4.1 Build/update the Program picker UI to show only file-capable programs from the discovery use case.
- [x] 4.2 Add selected-program details panel showing program type and normalized file-capable properties.
- [x] 4.3 Add organisation unit selection control that gates event preview activation.
- [x] 4.4 Implement event preview table/list with loading, empty, error, and retry states.
- [x] 4.5 Add lightweight in-memory caching for repeated selections (program/org unit) within the page scope.

## 5. Verification and regression safety

- [x] 5.1 Add use case tests covering positive, empty, and failure scenarios for all three new capabilities.
- [x] 5.2 Add UI/component tests validating picker filtering, property rendering, and preview gating behavior.
- [x] 5.3 Run `yarn test` and fix any regressions introduced by the new flow.
- [x] 5.4 Perform manual validation against a DHIS2 instance with at least one eligible and one ineligible program.
