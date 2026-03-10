## Context

Step 1 currently combines a basic form control and a dense table inside a full-width content panel. The code in [WizardPage.tsx](/home/m/Documentos/eyeseetea/file-export/src/webapp/pages/wizard/WizardPage.tsx) shows that the step has two user decisions: choose a program and choose one or more file data values. The current presentation does not distinguish those decisions from the metadata that supports them.

The redesign needs to stay within the existing wizard architecture, preserve current state and validation behavior, and prefer DHIS2-native components. This is a UI-only change at the architecture level: no domain model, repository, or use-case changes are needed.

## Goals / Non-Goals

**Goals:**
- Make Step 1 visually easier to scan by introducing a clear top-down hierarchy.
- Keep the main interaction in a narrower content column instead of spanning the full wizard width.
- Use a filterable DHIS2 selector for program choice.
- Present file data values in a selection-first layout where metadata supports the choice instead of dominating it.
- Preserve existing behavior for loading, validation, selected files, and navigation.

**Non-Goals:**
- Changing the underlying Step 1 validation rules.
- Reordering wizard steps or changing the template/preview/storage flow.
- Redesigning the entire wizard shell beyond the Step 1 content area.
- Introducing new data-fetching behavior or additional backend calls.

## Decisions

### Use a constrained Step 1 content column with a secondary summary panel

Step 1 will move from a single full-width flow to a layout with a capped main content width and an optional summary panel for selected-program context. This creates separation between the decision area and supporting information without changing the surrounding wizard shell.

Alternative considered: keep a single-column full-width layout and only restyle the controls.
Why not: it would improve cosmetics but not fix the scanning problem caused by oversized line length and equal visual weight across all content.

### Replace the native program select with `SingleSelectField`

The program selector will use DHIS2 `SingleSelectField` with filtering enabled. This aligns with the user's guidance, improves discoverability for long program lists, and keeps Step 1 visually consistent with the rest of the DHIS2 ecosystem.

Alternative considered: keep the native `<select>` and add helper text.
Why not: it does not solve searchability and continues the mismatch between the wizard and DHIS2-native form patterns.

### Replace the Step 1 table with a selectable card or stacked-option list

The current table makes the file list feel like a report rather than a choice. The implementation should render each file field as an explicit selectable item with:
- a checkbox as the primary affordance,
- the field name as the primary label,
- supporting metadata such as value type and program stage as secondary text or chips.

Alternative considered: keep the table and visually emphasize the first column.
Why not: the table structure still implies equal importance across columns and remains harder to scan on smaller screens.

### Keep existing state shape and selection logic

The redesign should remain a presentation refactor around the existing `selectedProgramId` and `selectedFileDataValueIds` flow. This lowers risk and keeps the change local to the wizard page and tests.

Alternative considered: extract Step 1 into a new subcomponent with a new state model.
Why not: extraction may still happen during implementation, but it is not required to deliver the behavioral change and would expand scope unnecessarily.

## Risks / Trade-offs

- `[Layout drift across breakpoints]` → Add responsive rules so the summary panel collapses below the main content on narrower widths.
- `[Test fragility from DOM changes]` → Prefer stable test ids around Step 1 controls and assert behavior over exact markup structure.
- `[Using richer UI while preserving accessibility]` → Keep explicit labels, helper text, and checkbox semantics when moving from table rows to cards/list items.
- `[Summary content becoming redundant]` → Limit the summary panel to high-signal facts such as program type, file count, and stage availability.

## Migration Plan

No data or backend migration is required.

Implementation rollout:
1. Update Step 1 rendering and styles.
2. Update unit tests for program selection and file selection.
3. Run typecheck, lint, and wizard tests.

Rollback strategy:
- Revert the Step 1 UI changes in `WizardPage.tsx` and `WizardPage.css`.

## Open Questions

- Whether the file options should be implemented as visual cards or as a compact stacked list with stronger row styling.
- Whether the Step 1 summary panel should always render or collapse when no program is selected.
- Whether the program summary should include program stage names when multiple stages contain file-capable fields.
