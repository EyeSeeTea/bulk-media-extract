## 1. Spec And Assertion Alignment

- [x] 1.1 Restore the landing-page and wizard program-type rendering so `WITH_REGISTRATION` maps to `Tracker Program` and `WITHOUT_REGISTRATION` maps to `Event Program`.
- [x] 1.2 Align any shared fixtures or helper assertions touched by those tests so both surfaces continue asserting the same wording.

## 2. Verification

- [x] 2.1 Run `yarn test` and confirm the stale program-type label failures are resolved.
- [x] 2.2 Review the test output for any remaining failures that are unrelated to the program-type label update before closing the change.
