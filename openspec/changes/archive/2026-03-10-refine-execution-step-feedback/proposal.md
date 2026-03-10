## Why

The execution step now works, but its presentation is still uneven and too sparse for a long-running export. While users wait for files to sync, the step should feel more structured, visibly active, and easier to scan without exposing too much noise by default.

## What Changes

- Reorganize the execution summary indicators into intentional pairs so processed/progress are grouped together and successes/failures are grouped together.
- Add a prominent visual progress bar that appears only after export starts and communicates ongoing progress with animation and a reasonable approximation while work is still in flight.
- Add an execution log section that appears only after export starts, is collapsed by default, and uses compact scrollable entries so long runs remain readable.
- Refine the completed-state messaging so successful runs use a positive success/valid treatment and surface the result-summary action directly from that state.
- Add a placeholder finish action to the final step for future completion flow work.
- Keep the existing execution behaviors, including retry, interruption, and downloadable result summary, while refining the visual hierarchy and copy of the execution step.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `file-export-wizard`: Execution-step requirements change to mandate grouped summary indicators, a post-start animated progress bar, a compact scrollable execution log, positive success-state messaging, and a placeholder finish action.

## Impact

- Affected code: `src/webapp/pages/wizard/WizardPage.tsx`, `src/webapp/pages/wizard/WizardPage.css`, execution-step tests, and any execution-state helpers needed to support visible log entries.
- Behavioral impact: no repository or use-case changes are expected; this change is focused on wizard presentation and execution-step feedback.
