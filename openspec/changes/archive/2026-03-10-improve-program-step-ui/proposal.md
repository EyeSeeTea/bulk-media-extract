## Why

Step 1 of the wizard currently makes the first decision in the flow feel heavier and less clear than it needs to be. The layout lacks hierarchy, stretches a narrow task across the full content width, and uses a metadata table that overemphasizes columns instead of the user decision: which file fields should move into the export flow.

## What Changes

- Redesign wizard Step 1 to use a stronger visual hierarchy with a constrained content width instead of a full-width form.
- Replace the native program `<select>` with a filterable DHIS2 `SingleSelectField` so long program lists remain searchable and consistent with the rest of the app.
- Replace the current file-data-value table with a selection-focused list or card layout that makes the primary action explicit and moves secondary metadata into supporting text or chips.
- Add a compact program summary area so users can immediately understand the selected program type and file-field availability before moving to Step 2.
- Refine empty, loading, and validation states in Step 1 so they guide the user without competing visually with the main selection controls.
- Document the current and proposed Step 1 layouts with review mock assets for implementation alignment.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `file-export-wizard`: Step 1 requirements change to mandate clearer hierarchy, a DHIS2 filterable program selector, and a selection-first presentation for file data values.

## Impact

- Affected code: `src/webapp/pages/wizard/WizardPage.tsx`, [WizardPage.css](/home/m/Documentos/eyeseetea/file-export/src/webapp/pages/wizard/WizardPage.css), and Step 1 wizard tests.
- UI dependencies: increased use of `@dhis2/ui` form components in the wizard.
- Test impact: Step 1 interaction and layout-oriented rendering tests will need updates.
