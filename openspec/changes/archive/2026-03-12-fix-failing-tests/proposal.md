## Why

The current test suite is failing because the landing page and wizard no longer render the required friendly program-type labels `Tracker Program` and `Event Program`. This breaks the documented UI contract and blocks local verification and CI.

## What Changes

- Restore the landing page and wizard program-type copy so `WITH_REGISTRATION` is shown as `Tracker Program` and `WITHOUT_REGISTRATION` is shown as `Event Program`.
- Keep the affected UI tests aligned with that copy across landing-page, program-details, wizard-step, and wizard-page coverage.
- Re-run the unit test suite after the UI and test updates to confirm the failing assertions are resolved and no broader regressions remain.

## Capabilities

### New Capabilities

### Modified Capabilities

- `landing-page-components`: Program details must present `WITH_REGISTRATION` as `Tracker Program` and `WITHOUT_REGISTRATION` as `Event Program`.
- `file-export-wizard`: Wizard summaries and step-level program metadata must use the same `Tracker Program` and `Event Program` labels.

## Impact

- Affected code: program-type label rendering in `src/webapp/pages/landing/` and `src/webapp/pages/wizard/`, plus related tests.
- User-facing behavior: the landing page and wizard return to the expected `Tracker Program` and `Event Program` labels.
- Delivery impact: restores a passing baseline for `yarn test`, which is currently blocked by five failing assertions across four test files.
