## 1. Wizard shell navigation refresh

- [x] 1.1 Remove the `Step X of Y: Title` subtitle from the wizard shell and replace the current step-tab markup with numbered step labels.
- [x] 1.2 Add explicit visual states for active, completed, available, and disabled steps, including blue-accented styling and a completed-step tick indicator.
- [x] 1.3 Keep the step tabs accessible by preserving button semantics and `aria-current="step"` for the active item.

## 2. Cross-step content consistency

- [x] 2.1 Introduce a shared intro/content hierarchy for wizard steps so headings, support copy, and section framing follow a consistent rhythm.
- [x] 2.2 Rebalance Step 1 so its title treatment no longer feels oversized relative to template, preview, storage, and execution.
- [x] 2.3 Add bottom page spacing and any supporting layout adjustments needed so long step content and the footer do not end abruptly.

## 3. Footer action overhaul

- [x] 3.1 Replace the plain action row with a dedicated footer action bar that gives Back and forward actions stronger spacing and prominence.
- [x] 3.2 Ensure the footer action layout remains usable and visually balanced on narrow viewports.
- [x] 3.3 Preserve existing navigation behavior, disabled states, and execution-step constraints while changing the presentation.

## 4. Verification

- [x] 4.1 Add or update wizard tests covering subtitle removal, numbered step tabs, active/completed/disabled state rendering, and completion indicators.
- [x] 4.2 Add or update rendering tests for the shared step hierarchy and footer action bar behavior.
- [x] 4.3 Run `yarn typecheck`, `yarn lint`, and relevant wizard tests, then fix regressions introduced by the UI overhaul.
