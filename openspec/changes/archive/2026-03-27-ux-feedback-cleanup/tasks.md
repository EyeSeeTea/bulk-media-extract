## 1. InfoIconPopover component

- [x] 1.1 Create `src/webapp/components/info-icon-popover/InfoIconPopover.tsx` using dhis2/ui `Popover`, `IconInfo16`, and `Button` (small, icon-only) with click-to-toggle behaviour
- [x] 1.2 Verify popover opens on click, closes on outside click or re-click of the icon

## 2. Preview step message cleanup

- [x] 2.1 Remove the `<p>Preview the resolved export rows before continuing.</p>` paragraph from `PreviewStep.tsx`
- [x] 2.2 Update the StepIntro description to "Review the resolved target paths and any warnings before continuing to storage and execution."
- [x] 2.3 Remove the "Matching events: X. Pages: Y." text block from the preview footer

## 3. Export configuration help text → popover

- [x] 3.1 Replace the standalone paragraph below the "Export configuration" button with an `InfoIconPopover` next to the button
- [x] 3.2 Set popover content to explain it downloads a JSON snapshot and that import is not yet available

## 4. Preview table bounded height

- [x] 4.1 Add `max-height: 70vh; overflow-y: auto;` to `.wizard-preview-table-wrap` in `WizardPage.css`
- [x] 4.2 Verify `<th>` sticky positioning works within the scrollable container (ensure `z-index` keeps headers above rows)

## 5. Deduplicate validation notices

- [x] 5.1 Extend the step validation return type in `wizardConfig.ts` to support a `hasInlineNotice` flag alongside the error message
- [x] 5.2 Update `WizardShell.tsx` to suppress the generic "Validation required" NoticeBox when `hasInlineNotice` is true, while keeping the Next button disabled
- [x] 5.3 Set `hasInlineNotice = true` for the preview step when duplicate-path warnings are present
- [x] 5.4 Set `hasInlineNotice = true` for the storage step when a connection/directory validation error notice is already rendered

## 6. Translation cleanup

- [x] 6.1 Remove obsolete i18n keys for deleted messages from `translations.json`
- [x] 6.2 Add new i18n strings for the updated StepIntro description and popover content
