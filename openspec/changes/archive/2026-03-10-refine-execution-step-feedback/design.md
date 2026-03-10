## Context

The execution step in `WizardPage.tsx` currently shows four summary stats in a generic grid, a compact running message with a `CircularLoader`, and status notices after completion. That covers baseline feedback, but it does not create a strong visual hierarchy for a long-running export. The current layout also does not expose a dedicated progress bar or an execution log, so users have little to look at beyond counters while the browser is transferring files.

This is a view-layer refinement inside the existing wizard flow. The current execution runner, interruption support, and downloadable report should remain intact. The main constraint is to improve perceived clarity and activity without introducing new domain dependencies or changing the underlying execution contract.

## Goals / Non-Goals

**Goals:**
- Make execution progress easier to scan by grouping the summary indicators into two intentional pairs.
- Introduce a prominent progress region that appears only after the user starts an export.
- Provide a collapsible execution log that is available during and after a run without dominating the step by default.
- Make the completed state feel positively resolved, with the result-summary action available in-context.
- Add a placeholder finish affordance on the final wizard step without changing navigation behavior yet.
- Preserve the existing execution actions and result-summary behavior while improving the step’s visual consistency.

**Non-Goals:**
- Changing export orchestration, retry semantics, interruption semantics, or the execution report schema.
- Introducing backend-side logging or persistent run-history storage.
- Redesigning other wizard steps as part of this change.

## Decisions

### Use a dedicated execution-status panel instead of scattered inline feedback

The execution step should render a single status panel that contains the paired indicators, the progress bar, and the collapsible log once execution has started. This keeps the progress-related information in one place and avoids splitting the user’s attention between separate stat cards and a small inline running notice.

Alternative considered: keep the current stat grid and add a progress bar below it.
Why not: that would satisfy the new requirement technically, but the step would still feel piecemeal and visually inconsistent.

### Keep indicator grouping semantic and stable

The panel should present `Processed` next to `Progress`, and `Successes` next to `Failures`, using consistent card styling and alignment. These pairings match how users monitor throughput versus quality: one pair answers “how far along are we,” and the other answers “how well is it going.”

Alternative considered: preserve a four-card uniform grid and rely on ordering alone.
Why not: the request is explicitly about pairing related indicators, and ordering alone is too weak visually.

### Drive the progress bar from existing execution state with a small in-flight approximation

The progress bar should use the existing `processed`, `total`, and `progress` state as its baseline. While a file transfer is in flight, the UI can add subtle animated treatment to communicate activity without pretending to know byte-level upload progress. A determinate bar with an animated overlay or pulse is sufficient because the app currently tracks completed operations, not streamed transfer percentages.

Alternative considered: add true byte-level progress reporting for downloads and uploads.
Why not: that would require deeper transport changes and likely new networking primitives, which is disproportionate for this UI-focused proposal.

### Track a lightweight UI log alongside the execution report

The visible log should not wait for the final downloadable report. Instead, the execution step should append lightweight UI log entries as notable events happen: run started, per-file success, per-file failure, interruption, and completion. Completed transfer results can still map cleanly to report entries, while transient events such as `started` or `interrupted` remain UI-only.

Alternative considered: derive the visible log entirely from `executionState.report?.results`.
Why not: that would leave the log sparse or empty until the run finishes or enough transfers have completed, which weakens its value during execution.

### Keep the expanded log compact and bounded

When expanded, the log should prioritize density over card-like spaciousness. Entries should use tighter spacing, compact metadata, and a bounded scroll container so long runs do not push the rest of the step far below the fold.

Alternative considered: allow the log to expand to full natural height with the same roomy entry styling as the main stats.
Why not: that makes the step unwieldy on large exports and weakens the scanability of the detailed activity list.

### Hide progress-specific UI before execution starts

The progress bar and log should render only after the user starts an export. Before that point, the step should stay focused on the intro, summary baseline, and execution action so the UI does not advertise empty runtime containers.

Alternative considered: always show disabled or empty placeholders for the progress bar and log.
Why not: the request explicitly limits them to the post-start state, and empty containers would add noise.

### Move successful result-summary access into the success feedback region

For successful runs, the download-summary action should appear inside the positive completion notice instead of only in the generic action row. That keeps the main “what happened” message and the follow-up action together.

Alternative considered: leave the download action only in the action row for every terminal state.
Why not: the user specifically wants it present in the completed success notice, and that placement is clearer once the run has finished cleanly.

### Add a placeholder finish action without introducing completion behavior yet

The final step should expose a `Finish` button now, but its handler can remain a no-op until a later change defines what finishing means. The button should be visually present so the final step already has the expected end-of-flow affordance.

Alternative considered: omit the button until its behavior is fully defined.
Why not: the user explicitly wants the affordance now, and a placeholder button is low-risk as long as it does not imply hidden behavior.

## Risks / Trade-offs

- `[Large logs may become visually noisy on long runs]` → Keep the log collapsed by default, render concise entries, and cap the expanded region with scroll.
- `[Animated progress treatment could feel misleading]` → Use animation only to signal active work, while keeping the numeric progress value tied to completed-operation counts.
- `[Extra execution-step state could drift from the report summary]` → Derive success and failure entries from the same execution callbacks that update the report and reset the UI log when a new run begins.
- `[Accordion behavior may be inconsistent with DHIS2 styling]` → Prefer simple semantic HTML such as `details/summary` or a minimal custom toggle styled within the current wizard CSS instead of introducing a new dependency just for disclosure UI.
- `[Placeholder finish action may confuse users]` → Label it clearly as `Finish`, keep it in the final step only, and avoid wiring it to any hidden navigation until a follow-up change defines that flow.

## Migration Plan

No data migration is required.

Implementation rollout:
1. Refactor the execution-step markup and styling into a stronger status panel with paired indicators.
2. Add the post-start progress bar and animated active state using the existing execution progress values.
3. Introduce lightweight execution-log state and a collapsed disclosure control that becomes visible after start.
4. Update execution-step rendering tests to cover visibility rules, grouped indicators, compact log behavior, success-state actions, and the placeholder finish button.
5. Run typecheck, lint, and targeted wizard tests.

Rollback strategy:
- Revert the execution-step presentation changes in `WizardPage.tsx` and `WizardPage.css`.

## Open Questions

- Whether the collapsed log summary should show a count of log entries, failures, or both.
- Whether the progress panel should remain visible after a finished run exactly as-is or switch to a calmer completed-state treatment while preserving the same structure.
