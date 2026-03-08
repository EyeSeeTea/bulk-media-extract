## 1. Wizard foundation

- [x] 1.1 Add wizard route/container and wire it from the current export entry point without removing the legacy path.
- [x] 1.2 Implement shared wizard state context (step index, form state, validation state) in `src/webapp/`.
- [x] 1.3 Define canonical step configuration (scope, storage, template, preview, execution) with next/previous transition guards.

## 2. Step implementation and validation

- [x] 2.1 Build scope step with program/org unit/date-range inputs and required-field validation feedback.
- [x] 2.2 Build storage configuration step with connection validation and blocking behavior for invalid settings.
- [x] 2.3 Build template mapping step with template syntax validation and inline error reporting.
- [x] 2.4 Ensure back/next navigation preserves entered values across all wizard steps in-session.

## 3. Preview and execution integration

- [x] 3.1 Integrate wizard preview step with existing event preview flow, enforcing program/org unit/date-range gating before preview runs.
- [x] 3.2 Update preview UI behavior to satisfy modified `org-unit-event-preview` requirements in wizard context.
- [x] 3.3 Integrate final step with existing export execution use case and display progress states during transfer.
- [x] 3.4 Add failure and retry handling for export errors while preserving previously entered wizard configuration.

## 4. Quality and rollout readiness

- [x] 4.1 Add unit tests for step transition guards and wizard state persistence across back/next navigation.
- [x] 4.2 Add component/integration tests for validation blocking, preview gating, and successful execution flow.
- [x] 4.3 Run `yarn typecheck`, `yarn lint`, and `yarn test`, and fix regressions introduced by the wizard.
- [ ] 4.4 Validate the wizard manually with representative DHIS2 program/org unit combinations and document any follow-up issues.
