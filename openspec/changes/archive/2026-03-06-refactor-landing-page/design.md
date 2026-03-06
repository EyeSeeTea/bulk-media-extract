## Context

The current `LandingPage.tsx` is a 289-line monolithic component that violates Clean Architecture principles by mixing:
- Multiple async state management (4 separate `useState` hooks)
- Data fetching logic (4 `useCallback` hooks wrapping use case execution)
- Caching logic (2 `useRef` caches with manual key management)
- Complex side effects (3 `useEffect` hooks for auto-fetching)
- UI presentation (3 distinct sections)

This violates the project's frontend standards which mandate:
- Components should not include business logic
- Prefer separate custom hooks for logic
- Prefer small, composable components

The refactor must maintain backward compatibility (no breaking changes to user experience or external APIs).

## Goals / Non-Goals

**Goals:**
- Extract reusable async data management hooks
- Create domain-specific data fetching hooks
- Split UI into focused, testable components
- Reduce LandingPage to a thin orchestration layer (<50 lines)
- Maintain existing functionality and user experience

**Non-Goals:**
- Changing the visual appearance or layout
- Modifying the underlying use cases or domain logic
- Adding new features or capabilities
- Changing the caching strategy (keep in-memory caching)

## Decisions

### Decision 1: Two-tier hook architecture
**Choice**: Create generic `useAsyncData` / `useCachedAsyncData` hooks, then domain-specific hooks that wrap them.

**Alternatives considered**:
- Direct integration of caching into each domain hook → Rejected: Less reusable, harder to test
- Using external state management (Redux, Zustand) → Rejected: Overkill for component-local state

**Rationale**: Two-tier approach promotes reusability and testability. Generic hooks can be used across the app, domain hooks encapsulate use case calls.

### Decision 2: Component decomposition by section
**Choice**: Split into `ProgramPicker`, `ProgramDetails`, `EventPreview` components matching the three visual sections.

**Alternatives considered**:
- Further decomposition (e.g., separate dropdown components) → Rejected: Over-engineering for current complexity
- Keep as single component with extracted hooks → Rejected: Still violates "small components" principle

**Rationale**: Section-based split aligns with existing HTML structure and user mental model. Each component has clear boundaries.

### Decision 3: Colocation of hooks with usage
**Choice**: Place generic hooks in `src/webapp/hooks/`, domain hooks in `src/webapp/pages/landing/hooks/`.

**Alternatives considered**:
- All hooks in global `src/webapp/hooks/` → Rejected: Pollutes global namespace with page-specific hooks
- Hooks alongside components → Rejected: Reduces discoverability for reuse

**Rationale**: Generic hooks (async state management) are globally useful. Domain hooks (landing page data fetching) are page-specific but benefit from separation for testability.

### Decision 4: Preserve existing caching behavior
**Choice**: Keep `useRef`-based in-memory caching with string keys, just move to `useCachedAsyncData` hook.

**Alternatives considered**:
- Remove caching → Rejected: Performance regression
- Use React Query or SWR → Rejected: Avoids introducing new dependencies

**Rationale**: Existing caching works correctly and avoids redundant API calls. Moving to hook makes it reusable and testable.

### Decision 5: Preserve AsyncData type definition
**Choice**: Keep the existing `AsyncData<T>` type definition locally in the hook file.

**Alternatives considered**:
- Move to global types → Rejected: Not yet widely used across app
- Use external type library → Rejected: Avoids dependency

**Rationale**: Type is well-defined and specific to async data management pattern. Can be promoted to global later if needed.

## Risks / Trade-offs

**[Risk]** New hooks add indirection that may be harder for junior devs to follow  
→ **Mitigation**: Add JSDoc comments explaining hook responsibilities, include usage examples in tests

**[Risk]** Component splitting increases file count (1 file → ~10 files)  
→ **Mitigation**: Clear folder structure with `components/` and `hooks/` subdirectories. Each file has single, clear purpose

**[Risk]** Caching logic in hooks may not be obvious during debugging  
→ **Mitigation**: Add console logs or dev tools for cache hits/misses (future enhancement)

**[Trade-off]** Generic hooks are more abstract and may be harder to understand in isolation  
→ **Accepted**: Standard React pattern, benefits outweigh learning curve

**[Trade-off]** More test files required  
→ **Accepted**: Better test isolation and coverage, aligns with testing best practices

## Migration Plan

1. Create new hook files without modifying LandingPage
2. Create new component files without modifying LandingPage
3. Update LandingPage to use new hooks and components
4. Run existing tests to verify no regressions
5. Add new tests for hooks and components
6. Update LandingPage tests to reflect simpler structure

**Rollback**: Git revert is sufficient - no data model or API changes.

## Open Questions

None - design is straightforward refactor with well-established React patterns.
