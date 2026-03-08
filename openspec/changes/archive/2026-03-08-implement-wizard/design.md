## Context

The current file export flow is fragmented across independent selectors and actions, which makes it easy to run exports with incomplete configuration. The domain and data layers already expose most required operations (program/stage selection, org unit scoping, event preview, storage validation, and export execution), but the presentation layer does not orchestrate them as a guided path. The design must respect clean architecture boundaries and reuse existing use cases from the composition root.

## Goals / Non-Goals

**Goals:**
- Deliver a deterministic multi-step wizard that guides users from scope selection to export execution.
- Enforce per-step validation gates and prevent progression when required state is invalid.
- Preserve user inputs while navigating back and forth between steps.
- Integrate preview and export execution using existing use cases and error models.

**Non-Goals:**
- Replacing existing domain use cases or repository contracts.
- Adding new storage providers in this change.
- Redesigning unrelated landing page or settings screens.

## Decisions

1. Introduce a dedicated wizard state context in `src/webapp/`.
Rationale: Step state is cross-cutting and should be shared across route segments/components without prop drilling.
Alternative considered: local state per step with URL params. Rejected because validation and back/next gating become fragile and duplicated.

2. Model wizard flow as explicit step definitions with transition guards.
Rationale: A central step registry (id, required fields, validation, next/previous) keeps progression logic testable and avoids implicit UI-only transitions.
Alternative considered: hardcoded button handlers in each step. Rejected due to duplicated guard logic and weak testability.

3. Reuse existing preview and export use cases through CompositionRoot wiring.
Rationale: Maintains clean architecture separation and avoids bypassing domain logic from React components.
Alternative considered: direct repository calls from UI. Rejected because it violates architecture rules and duplicates error handling.

4. Persist in-progress wizard state in memory for session continuity, with optional URL-safe step index.
Rationale: Users can navigate between steps without data loss while avoiding the complexity of long-term persistence.
Alternative considered: localStorage persistence. Rejected for this iteration to avoid stale-config and migration concerns.

## Risks / Trade-offs

- [Risk] Wizard introduces more UI state complexity than current screens. -> Mitigation: centralize state machine-like transitions and add unit tests for guard logic.
- [Risk] Existing preview APIs may have latency that degrades wizard experience. -> Mitigation: show loading states and prevent duplicate requests with request in-flight guards.
- [Risk] Coupling to current screen routing can cause regressions in legacy flow. -> Mitigation: isolate wizard route and keep existing flow accessible until rollout confidence is achieved.
- [Trade-off] In-memory persistence is simple but not resilient to full page reload. -> Mitigation: show clear warning before reload-sensitive steps and evaluate durable persistence in a follow-up change.

## Migration Plan

1. Add wizard route and container page behind current navigation entry.
2. Implement step components and shared context with transition guards.
3. Integrate event preview and export execution in final steps.
4. Validate manually with representative programs/org units and run existing test/typecheck suite.
5. Roll out as default export entry once acceptance criteria are met; keep fallback path temporarily.

Rollback strategy: remove navigation entry to wizard route and point users back to the existing flow; no data migration required.

## Open Questions

- Should draft wizard state be persisted across browser refresh in this change or deferred?
- Do we require a dedicated review/confirmation step for potentially large exports before execution?
