## Context

The current export wizard accepts path and filename templates as free-text input, while program file properties are shown as a flat list. This creates high cognitive load because users must remember placeholder syntax and where each property comes from. The application already has capability-specific metadata inspection and event preview flows, but they are not connected into a guided template authoring experience.

This change spans domain use cases, data repositories, and wizard UI behavior. It must support both tracker and event programs, keep compatibility with existing template syntax, and avoid introducing backend changes.

## Goals / Non-Goals

**Goals:**
- Provide a side-by-side template editor and structured property browser in the wizard.
- Normalize available placeholders into sections that adapt to program type.
- Insert placeholders at cursor position in the active template input.
- Validate templates inline and only enable preview rendering when valid.
- Render a quick resolved preview for the first 10 events using selected wizard context.

**Non-Goals:**
- Changing template language semantics or introducing a new DSL.
- Persisting reusable template snippets across users or sessions.
- Exporting preview results beyond on-screen validation.
- Adding new DHIS2 backend endpoints.

## Decisions

### Decision: Introduce a dedicated visual template builder component in the wizard
- Rationale: A focused component keeps existing wizard step orchestration intact while enabling richer interactions (cursor insertion, grouped browsing, validation states).
- Alternatives considered:
- Keep a plain textarea and add helper text. Rejected because it does not solve discoverability and insertion friction.
- Split into a separate page. Rejected because it breaks the step-based workflow and state continuity.

### Decision: Extend property inspection output with grouped, program-type-aware sections
- Rationale: The UI should receive normalized groups rather than infer grouping from raw metadata. This reduces frontend branching and keeps domain logic centralized.
- Alternatives considered:
- Group in React only. Rejected because grouping rules become duplicated and harder to test.
- Fetch full metadata ad hoc in component. Rejected because it increases coupling and bypasses existing repositories/use cases.

### Decision: Reuse preview pipeline and add template-resolution projection for top 10 rows
- Rationale: Existing preview capability already handles scoped event retrieval and error states. Extending it with template resolution minimizes risk and avoids new API contracts.
- Alternatives considered:
- Build a dedicated preview endpoint. Rejected because it adds backend dependency and deployment complexity.
- Resolve template on full export dataset. Rejected due to performance cost and mismatch with "quick preview" intent.

### Decision: Gate quick preview strictly on valid template and complete scope context
- Rationale: Preventing invalid requests reduces noisy API traffic and gives deterministic user feedback.
- Alternatives considered:
- Allow preview with invalid template and show partial output. Rejected because it produces ambiguous results and complicates validation UX.

## Risks / Trade-offs

- [Incorrect grouping across tracker/event programs] -> Mitigation: add fixture-driven unit tests covering tracker attributes, tracker stage data elements, and event program elements.
- [Cursor insertion behaves inconsistently across browsers/inputs] -> Mitigation: centralize insertion logic and test with controlled input refs and fallback append behavior.
- [Preview adds extra requests on user typing] -> Mitigation: validate first, debounce preview trigger, and only fetch on explicit preview action or stable valid state.
- [Template resolution mismatch between preview and export] -> Mitigation: share the same template parser/resolver utilities between preview and export code paths.

## Migration Plan

1. Introduce normalized property group models and adapters in domain/data layers.
2. Implement visual builder UI behind the existing template step.
3. Wire grouped property insertion and inline validation with existing wizard state.
4. Extend preview use case to resolve templates and cap results to 10.
5. Add/adjust tests for grouping, insertion, validation, and preview rendering.
6. Release with no data migration required; rollback by disabling the visual builder component and keeping existing plain-template input path.

## Open Questions

- Should quick preview refresh automatically on each valid template edit, or only on explicit user action?
- For tracker programs, should tracked entity attributes and enrollment-level metadata appear as separate groups or a single "entity context" group?
- Should quick preview show one combined resolved path/filename string, or separate columns for path and filename when both templates are configured?
