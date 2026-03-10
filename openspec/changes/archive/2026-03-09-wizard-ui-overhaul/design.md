## Context

The current wizard shell in `WizardPage.tsx` mixes several competing patterns:
- the page header includes a subtitle with `Step X of Y: Title`,
- the step tabs are text-only cards without explicit number or completion iconography,
- Step 1 has a strong hero heading while later steps mostly open with plain paragraphs or section headings,
- the footer actions sit in a simple row that does not give primary navigation enough weight.

The requested overhaul is cross-cutting within the wizard page because the issues are not isolated to one step. The implementation must preserve the existing step order, validation gating, and in-memory state model from `WizardContext`, while making the shell feel more consistent with DHIS2.

## Goals / Non-Goals

**Goals:**
- Make wizard progress understandable from the step tabs alone, without a redundant progress subtitle.
- Give each step a consistent intro and section hierarchy so one step does not visually dominate the others.
- Make completed, active, available, and disabled steps visually distinct and accessible.
- Make Back and Next actions more prominent and better spaced, especially on wider layouts.
- Add bottom spacing so the wizard page ends with intentional breathing room.

**Non-Goals:**
- Changing the underlying step order, validation rules, or execution behavior.
- Reworking domain/data layers or adding new backend interactions.
- Redesigning each individual step from scratch beyond what is needed to align hierarchy and shell styling.
- Introducing a new design system outside the existing DHIS2 UI vocabulary.

## Decisions

### Centralize the overhaul in the wizard shell instead of per-step one-offs

The shell-level elements in `WizardContent` should become the primary source of progress and navigation framing. This includes removing the `Step X of Y` subtitle, enriching the step tabs, and restructuring the footer action row.

Alternative considered: patch each step independently with local headings and spacing tweaks.
Why not: that would keep the inconsistency problem alive because the shell would still communicate step state weakly and each step could continue drifting.

### Represent step state with explicit numbered badges and completion indicators

Each step tab should render a stable number plus title, and completed steps should also show a success indicator. Active, completed, clickable, and disabled states should have distinct styling based on DHIS2-friendly blue neutrals instead of the current green-heavy treatment.

Alternative considered: keep text-only tabs and rely only on border/background changes.
Why not: the requested UX specifically calls for numbering, clearer disabled/completed affordances, and stronger reassurance when a step is valid and done.

### Introduce a shared step-intro pattern inside step content

The step body should use a small shared intro region near the top of each step with a title and supporting copy when needed. Step 1 should be rebalanced into that pattern so its large hero heading does not feel structurally different from template, preview, storage, and execution.

Alternative considered: remove headings from Step 1 only.
Why not: that would solve one inconsistency by flattening Step 1, but it would not define what the other steps should look like, leaving the wizard without a consistent content rhythm.

### Use a dedicated footer action container with primary/secondary emphasis

Back and Next should move into a dedicated footer area with stronger spacing, optional sticky behavior only if needed during implementation, and clearer primary emphasis on the forward action. The footer should visually separate navigation from step content and remain responsive on narrow screens.

Alternative considered: keep the existing `actions-row` and only enlarge button size.
Why not: size alone does not address alignment, spacing, or the lack of a distinct action region.

### Keep state shape and validation logic unchanged

The overhaul should be implemented as a view-layer refactor around the existing wizard state and validation helpers. New presentational helpers or small subcomponents are acceptable, but they should consume the same `currentStep`, `WIZARD_STEPS`, and validation outputs already in place.

Alternative considered: refactor the wizard into a new page architecture.
Why not: the requested change is about UX consistency, and a state-model rewrite would add risk without increasing value.

## Risks / Trade-offs

- `[Visual mismatch with DHIS2 defaults]` → Reuse existing DHIS2 colors, spacing, and iconography rather than inventing a separate style language.
- `[Accessibility regression in step navigation]` → Preserve button semantics, `aria-current="step"`, and clear disabled states while adding decorative numbering and check icons.
- `[Cross-step copy drift]` → Define a shared intro structure and use it consistently instead of letting each step freeform its own heading treatment.
- `[Footer changes causing cramped mobile layouts]` → Add responsive stacking rules so actions remain prominent without overflowing on small screens.

## Migration Plan

No data migration is required.

Implementation rollout:
1. Refactor the wizard shell markup and styles for step tabs, subtitle removal, footer actions, and page spacing.
2. Align each step’s intro/content framing with the shared pattern, including softening the oversized Step 1 hero treatment.
3. Update wizard tests to assert the new step-state affordances and shared navigation structure.
4. Run typecheck, lint, and relevant wizard tests.

Rollback strategy:
- Revert the wizard shell and step-intro changes in `WizardPage.tsx` and `WizardPage.css`.

## Open Questions

- Whether completed steps should show the tick icon alongside the step number or replace the number once complete.
- Whether the footer action area needs sticky positioning on long steps or only stronger spacing and visual separation.
- How much intro copy each step should keep before the layout starts feeling repetitive.
