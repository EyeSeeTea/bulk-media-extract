## 1. Execution step layout refresh

- [x] 1.1 Refactor the execution-step summary markup in `WizardPage.tsx` so `Processed` and `Progress` render as one visual pair and `Successes` and `Failures` render as a second visual pair.
- [x] 1.2 Add the new execution status panel styling in `WizardPage.css` so the paired indicators feel consistent with the rest of the wizard UI.
- [x] 1.3 Preserve the existing start, retry, interrupt, and download-summary actions while fitting them into the refreshed execution-step layout.

## 2. Progress and log behavior

- [x] 2.1 Add a prominent progress bar that becomes visible only after export starts and uses the current execution state for percentage and active animation treatment.
- [x] 2.2 Introduce lightweight execution-log state or view helpers so the UI can show meaningful run activity during and after execution.
- [x] 2.3 Add a collapsed-by-default expand/collapse control for the execution log and keep the log hidden before execution starts.

## 3. Verification

- [x] 3.1 Update wizard execution-step tests to cover grouped indicators, post-start progress-bar visibility, and collapsed log behavior.
- [x] 3.2 Run the relevant verification commands, including targeted wizard tests and `yarn typecheck`, and fix regressions introduced by the execution-step refresh.

## 4. Final-step polish

- [x] 4.1 Make the expanded execution log denser and scrollable for long runs while preserving the collapsed-by-default behavior.
- [x] 4.2 Move the successful result-summary action into a positive completion notice and add a placeholder `Finish` button to the execution step.
- [x] 4.3 Shorten the execution-step intro copy and update tests plus verification for the new final-step polish.

## 5. Footer-level completion flow polish

- [x] 5.1 Move the placeholder `Finish` action to the wizard footer so it replaces `Next` on the final step instead of rendering inside the execution panel.
- [x] 5.2 Hide the `Latest target path` helper after a fully successful execution while keeping it available during running and non-success terminal states.
- [x] 5.3 Update execution-step tests and rerun targeted verification for the footer-level finish behavior.
