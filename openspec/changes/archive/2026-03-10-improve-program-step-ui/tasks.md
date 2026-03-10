## 1. Implementation

- [x] 1.1 Replace the Step 1 native program select with a filterable DHIS2 `SingleSelectField` while preserving existing selection behavior and test ids.
- [x] 1.2 Redesign the Step 1 layout to use a constrained primary content area and a secondary summary region that does not dominate the flow.
- [x] 1.3 Replace the current Step 1 file-data-value table with selection-first items that keep checkbox, file name, value type, and program stage visible.
- [x] 1.4 Refine Step 1 helper, loading, empty, and validation states so they match the new hierarchy.

## 2. Verification

- [x] 2.1 Update wizard tests to cover the filterable program selector and file-item selection behavior.
- [x] 2.2 Run `yarn typecheck`.
- [x] 2.3 Run `yarn lint`.
- [x] 2.4 Run `yarn test -- WizardPage`.

## 3. Review Artifacts

- [x] 3.1 Keep before/after Step 1 review assets with the change so implementation can be compared against the proposal intent.

## 4. Follow-up Refinements

- [x] 4.1 Remove the redundant "Step 1" kicker from the Step 1 hero card and tighten the visual relationship between the main content and summary panel.
- [x] 4.2 Replace raw UI program type codes with `Tracker Program` and `Event Program` everywhere they are displayed.
- [x] 4.3 Update Step 1 and landing-page tests for the refined layout and friendly program type labels.
- [x] 4.4 Run `yarn typecheck`.
- [x] 4.5 Run `yarn lint`.
- [x] 4.6 Run `yarn test -- WizardPage`.
- [x] 4.7 Run `yarn test -- ProgramDetails`.
