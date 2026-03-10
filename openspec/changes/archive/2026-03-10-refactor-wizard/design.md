## Context

The current wizard implementation already contains step-local components such as `ProgramStep`, `TemplateStep`, `PreviewStep`, `StorageStep`, and `ExecutionStep`, but they all live inside `WizardPage.tsx` alongside route wiring, async orchestration, derived selectors, preview shaping, and execution lifecycle code. The result is a single file that owns too many responsibilities:

- composition root and app-context integration,
- wizard-context reads and writes,
- step-navigation shell rendering,
- step-specific derived state for program, template, preview, and execution flows,
- side effects for selection normalization and execution cleanup.

This refactor must respect the existing wizard behavior and the project architecture rules: keep domain/data layers unchanged, reuse existing use cases from `CompositionRoot`, and preserve the `WizardContext` state contract unless a small view-focused extension is clearly necessary.

## Goals / Non-Goals

**Goals:**
- Reduce `WizardPage.tsx` to a thin orchestration entry point.
- Split the wizard shell and step bodies into dedicated modules with clear ownership.
- Extract wizard-specific derived state and side-effect logic into reusable hooks/controllers.
- Preserve the current validation flow, export execution flow, and visible UX.
- Make wizard code easier to test at the step and hook level.

**Non-Goals:**
- Changing wizard step order, validation rules, or storage/export behavior.
- Rewriting `WizardContext` into a new state machine or introducing a new global store.
- Moving domain logic out of the existing helper modules unless it directly supports the new composition boundaries.
- Redesigning the wizard UI as part of this refactor.

## Decisions

### Keep `WizardPage` as a route entry that only wires providers and the top-level container

`WizardPage` should keep the current `WizardProvider` bootstrap and app-context integration, but step rendering should move into a dedicated container such as `WizardLayout` or `WizardScreen`. The page file should not continue to own step markup, large derived-data blocks, or run-control effects.

Alternative considered: keep the current single file and only reorder functions.
Why not: that improves readability slightly, but it does not create durable module boundaries or meaningfully lower review risk.

### Split the wizard into shell components plus step modules

The shell concerns should live separately from the step bodies:
- a shell component for page framing, step tabs, validation notice placement, and footer actions,
- one module per step for step-specific UI,
- shared presentational pieces such as `StepIntro`, summary cards, and execution log sections extracted only where reused.

Alternative considered: extract only the five step bodies and leave navigation/footer in the page.
Why not: the shell is one of the most cross-cutting parts of the wizard, and keeping it inline would leave the route component too large.

### Extract step-specific derived data into wizard hooks/controllers

The step modules should receive prepared inputs rather than rebuilding large `useMemo` chains inside the shell. Hooks should encapsulate view-layer orchestration such as:
- selected program and file-property derivation,
- preview source filtering and preview-row shaping,
- execution lifecycle control and cleanup,
- per-step helper actions such as inserting template tokens or downloading reports/configuration.

Alternative considered: pass raw context state to each step and let every step compute its own derived data.
Why not: that duplicates logic, makes tests noisier, and weakens the goal of keeping rendering modules focused on presentation.

### Preserve `WizardContext` as the source of truth for wizard state and transitions

`WizardContext` already centralizes mutation and validation gates. The refactor should keep that contract stable and build composition around it. New helper hooks can wrap the context for specific step needs, but step components should not create competing state containers.

Alternative considered: move all wizard derived state and transitions into a reducer-based controller.
Why not: this change is about decomposition, not a state model rewrite, and a larger state migration would add risk without unlocking the immediate maintainability benefit.

### Keep existing helper modules when they already represent stable domain-neutral logic

Modules such as `templateBuilder.ts`, `previewUtils.ts`, `executionRunner.ts`, `exportExecutionConfiguration.ts`, and `exportExecutionReport.ts` already separate some concerns from the page. The refactor should reuse them and add thin step-specific adapters around them instead of redistributing this logic arbitrarily.

Alternative considered: fold helper functions back into new step components for locality.
Why not: that would reverse useful separation and make shared logic harder to test independently.

### Reorganize tests around composition boundaries

Tests should follow the new structure:
- shell-level tests for navigation and step switching,
- focused step component tests for rendering and interactions,
- hook/controller tests for derived data and execution lifecycle behavior,
- retained integration coverage for the end-to-end wizard flow.

Alternative considered: keep only the existing broad page tests.
Why not: a refactor without boundary-level tests would make the new structure easy to erode in later changes.

## Risks / Trade-offs

- [Refactor churn breaks subtle wizard interactions] → Preserve existing utilities and context actions, then add focused tests before removing old inline logic.
- [Too many tiny files make the wizard harder to navigate] → Split by stable responsibility boundaries only: shell, steps, and support hooks/controllers.
- [Hooks become thin wrappers with little value] → Extract only logic that removes real complexity from rendering modules or is independently testable.
- [Execution-step lifecycle leaks after file moves] → Keep `executionRunner` ownership explicit and cover cancellation/cleanup with targeted tests.

## Migration Plan

1. Extract shared shell and step modules while keeping imports pointed at the current helper files and `WizardContext`.
2. Move step-specific derived data and side-effect orchestration into wizard hooks/controllers.
3. Reduce `WizardPage.tsx` to provider bootstrap plus the top-level wizard container.
4. Update or split tests to cover the new modules and keep regression coverage for the full wizard flow.
5. Run typecheck, lint, and targeted wizard tests.

Rollback strategy:
- Revert the refactor modules and restore the previous single-file composition in `WizardPage.tsx`.

## Open Questions

- Whether step-specific hooks should live directly under `src/webapp/pages/wizard/hooks/` or alongside each step module.
- Whether the execution step should expose a dedicated controller hook or keep a smaller adapter around `executionRunner.ts`.
