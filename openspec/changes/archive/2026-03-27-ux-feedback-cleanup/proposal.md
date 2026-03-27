## Why

The wizard's Step 3 (Preview) and Step 4 (Storage) contain redundant messages, verbose notices, and a help text layout that clutters the interface. Reducing noise improves scannability and lets users focus on actionable information.

## What Changes

- Remove the redundant "Preview the resolved export rows before continuing." paragraph; keep only the improved `StepIntro` description.
- Remove the "Matching events: X. Pages: Y." footer text (already covered by the files/total-size stats grid).
- Move the "Download a JSON execution configuration…" help text into an info-icon popover next to the "Export configuration" button, clarifying that import is not yet available. Introduce a reusable `InfoIconPopover` wrapper around dhis2/ui `Popover` + `IconInfo16`.
- Add a max-height with vertical scroll on `.wizard-preview-table-wrap`, keeping table headers sticky via `position: sticky`.
- Deduplicate notices within the same step: when a specific warning (e.g. "Duplicate target filepaths detected") already conveys the validation issue, suppress the generic "Validation required" notice for that step. Apply the same logic in Step 4 where a connection-error notice coexists with "Validation required".

## Capabilities

### New Capabilities

- `info-icon-popover`: Reusable component wrapping dhis2/ui Popover triggered by an info icon button, for inline contextual help.

### Modified Capabilities

- `file-export-wizard`: Adjust preview step notices, remove redundant messages, add table scroll, and deduplicate validation notices across steps 3 and 4.

## Impact

- **Components**: `PreviewStep.tsx`, `WizardShell.tsx` (validation notice dedup), `StorageStep.tsx` (validation notice dedup), new `InfoIconPopover` component.
- **CSS**: `WizardPage.css` — add max-height / overflow-y rules for `.wizard-preview-table-wrap`, sticky header adjustments.
- **i18n**: Remove obsolete translation keys; add new popover copy.
- **No API or domain-layer changes.**
