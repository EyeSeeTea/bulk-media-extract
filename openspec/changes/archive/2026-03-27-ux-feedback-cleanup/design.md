## Context

Step 3 (Preview) currently shows several redundant or low-value messages: a paragraph repeating the StepIntro, an event/page count duplicating the stats grid, and a standalone help paragraph for the export-config button. The preview table can grow unbounded. Validation notices stack up — a specific warning (e.g. "Duplicate target filepaths detected") appears alongside the generic "Validation required" banner, producing noise. The same pattern occurs in Step 4 when a connection error coexists with "Validation required".

## Goals / Non-Goals

**Goals:**
- Reduce notice noise by removing redundant messages and deduplicating validation banners.
- Move contextual help into an inline info-icon popover next to the export-config button.
- Constrain the preview table height with sticky headers for large file sets.
- Introduce a reusable `InfoIconPopover` component using dhis2/ui primitives.

**Non-Goals:**
- Redesigning the wizard step layout or navigation.
- Changing the export-configuration JSON structure or adding import functionality.
- Modifying the preview data model or duplicate-detection logic.

## Decisions

### 1. Reusable InfoIconPopover component

Create `src/webapp/components/info-icon-popover/InfoIconPopover.tsx`. Uses dhis2/ui `Popover`, `IconInfo16`, and `Button` (small, secondary, icon-only). Renders an icon button that toggles a `Popover` anchored to it. Accepts `children` for popover content.

**Rationale**: A thin wrapper keeps the toggle+anchor logic in one place. Using dhis2/ui `Popover` (not `Tooltip`) gives richer content support and click-to-dismiss behaviour consistent with the rest of the app.

### 2. Remove redundant preview messages

- Delete the `<p>Preview the resolved export rows…</p>` element (line ~165 in PreviewStep).
- Delete the "Matching events: X. Pages: Y." text block (lines ~290-294).
- Improve the StepIntro description to be self-sufficient: "Review the resolved target paths and any warnings before continuing to storage and execution."

**Rationale**: The StepIntro already communicates purpose; the extra paragraph and event/page counts add no information beyond what the stats grid and table already show.

### 3. Export-config help text → InfoIconPopover

Replace the paragraph below the "Export configuration" button with an `InfoIconPopover` placed inline next to the button. Popover content: "Download a JSON snapshot of the current export plan. Import is not yet available, but this file can serve as a backup of the reviewed configuration."

**Rationale**: Keeps the help discoverable without consuming vertical space.

### 4. Preview table max-height with sticky headers

Add `max-height: 70vh; overflow-y: auto;` to `.wizard-preview-table-wrap`. The `<th>` elements already have `position: sticky; top: 0;` — verify and ensure `z-index` keeps them above scrolling rows.

**Rationale**: 70vh keeps the table visible within the viewport while allowing scroll for large datasets. The sticky headers already exist in CSS; only the container constraint is missing.

### 5. Deduplicate validation notices

Modify `WizardShell.tsx` so the generic "Validation required" `NoticeBox` is suppressed when the current step already renders its own specific warning/error notice. Approach: add an optional `hasInlineValidationNotice` flag to the step config (returned from step validation logic). When `true`, WizardShell skips rendering its own notice but still disables the Next button.

For Step 3: set `hasInlineValidationNotice = true` when `previewSummary.duplicateTargetPathDetails.length > 0`.
For Step 4: set `hasInlineValidationNotice = true` when the storage method has a validation error (e.g. `webdav.error` or `localDirectory.error`).

**Alternative considered**: Removing the "Validation required" notice entirely. Rejected because for steps without inline notices (e.g. missing program selection), the generic notice is still needed.

## Risks / Trade-offs

- **Removing event/page count**: Some users may have relied on it for debugging pagination. Mitigation: the total file count in the stats grid is sufficient; page count was an internal detail.
- **70vh max-height**: On very short viewports the table may feel cramped. Mitigation: 70vh is generous and the user can still scroll; this is better than an unbounded table pushing content off-screen.
- **hasInlineValidationNotice coupling**: Step components need to communicate their notice state upward. Mitigation: use the existing step-validation return type, extending it from `string | undefined` to `{ message?: string; hasInlineNotice?: boolean }` or a similar lightweight shape.
