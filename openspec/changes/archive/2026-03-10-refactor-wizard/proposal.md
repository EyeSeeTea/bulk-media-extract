## Why

`WizardPage.tsx` has grown into a 2155-line component that mixes route orchestration, step rendering, derived state, async side effects, and execution control in one place. The wizard is still changing quickly, so continuing to extend it in this shape will make regressions more likely and future step work slower to implement and review.

## What Changes

- Extract the wizard shell and each step into focused components instead of keeping all step JSX inside `WizardPage.tsx`.
- Move wizard-specific derived data, side effects, and execution wiring into dedicated hooks or controller-style helpers that can be tested independently of the page shell.
- Keep `WizardPage` as a thin composition layer that connects app context, wizard context, and the current step modules.
- Preserve the current wizard flow, validation gates, export behavior, and existing user-visible interactions while improving code organization.
- Expand wizard tests to cover the new composition boundaries so later step changes can be made with less regression risk.

## Capabilities

### New Capabilities

- `wizard-page-components`: Composable shell and step components for the file export wizard.
- `wizard-support-hooks`: Wizard-specific hooks and controllers for derived state, async loading, and execution lifecycle handling.

### Modified Capabilities

None.

## Impact

- Affected code: `src/webapp/pages/wizard/WizardPage.tsx`, `src/webapp/pages/wizard/WizardContext.tsx`, existing wizard helpers, and new wizard submodules under `src/webapp/pages/wizard/`.
- Tests: wizard page, step, and helper tests will be updated or split to match the new structure.
- External APIs and end-user behavior are expected to remain unchanged.
