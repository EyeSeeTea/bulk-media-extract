## Context

The app currently depends on users manually knowing which DHIS2 programs contain file values before running export flows. This creates a usability gap and increases the chance of selecting programs that cannot produce file payloads. The new change introduces a guided entry flow that discovers file-capable programs from DHIS2 metadata, then helps users validate data availability through program property inspection and org-unit scoped event preview.

Constraints include DHIS2 metadata variability across tracker configurations, API pagination, and maintaining the existing clean-architecture boundaries (`domain` use cases, repository interfaces/implementations, composition root wiring, and webapp presentation). The design must keep framework-specific concerns out of domain entities/use cases and use repository abstractions for metadata and event retrieval.

## Goals / Non-Goals

**Goals:**
- Provide a program picker that only lists programs with at least one file-type source.
- Support discovery across event data elements, tracked entity attributes, and other file-capable program-linked properties exposed by DHIS2.
- Show selected program type and discovered file-capable properties in the UI.
- Allow selecting an org unit and previewing a limited set of matching events.
- Keep logic testable through domain use cases and repository contracts.

**Non-Goals:**
- Changing file transfer/export execution behavior.
- Introducing new storage provider capabilities.
- Building a full analytics or reporting view for event data.
- Backfilling or transforming historical DHIS2 metadata.

## Decisions

1. Add three explicit use cases in `src/domain/usecases/`:
- `GetFileCapableProgramsUseCase`
- `GetProgramFilePropertiesUseCase`
- `GetProgramEventsPreviewUseCase`

Rationale: Splitting by user action keeps command-style use cases focused and aligns with existing architecture.

Alternatives considered:
- One composite use case for the whole wizard step: rejected because it couples unrelated data fetches and complicates retries/cache.

2. Extend DHIS2 repository interfaces to expose file-capability discovery and preview APIs.

Rationale: Keeps webapp free from direct API orchestration and enables deterministic testing via test repositories.

Alternatives considered:
- Fetch directly in React hooks/components: rejected due to domain leakage and reduced testability.

3. Normalize metadata into a unified "file property descriptor" model returned by repository/use case.

Rationale: UI should not need separate code paths for data elements vs TEI attributes; a normalized shape simplifies rendering and future extensions.

Alternatives considered:
- Return raw DHIS2 payload fragments: rejected because it pushes parsing complexity to presentation and duplicates logic.

4. Event preview uses org-unit + selected program filters with a hard item limit (for example 20 rows) and explicit loading/error/empty states.

Rationale: Prevents heavy queries while giving users enough signal to validate program suitability.

Alternatives considered:
- Full pagination in first iteration: rejected to keep scope contained and avoid large UI/state complexity.

5. Add lightweight in-memory request caching per selected program/org unit within the page context.

Rationale: Avoid redundant metadata requests during repeated selections without introducing global persistence.

Alternatives considered:
- No cache: acceptable but causes repetitive calls and poorer UX.
- Shared global cache: rejected as premature and harder to invalidate safely.

## Risks / Trade-offs

- [Metadata coverage gaps across DHIS2 versions] -> Mitigation: define a repository mapping layer with graceful fallback for unknown structures and explicit logging.
- [Large metadata sets may slow initial discovery] -> Mitigation: constrain fields requested, use paginated/filtered API calls, and debounce fetch triggers in UI.
- [Preview endpoint differences for event vs tracker programs] -> Mitigation: centralize branching logic in repository implementation and cover both program types in tests.
- [Users may expect full event browsing] -> Mitigation: communicate preview limits and keep table focused on validation needs.
