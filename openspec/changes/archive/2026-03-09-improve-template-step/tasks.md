## 1. Property Model And Data Loading

- [x] 1.1 Extend the normalized template-property model to represent dedicated organisation unit and event groups plus organisation unit attribute tokens.
- [x] 1.2 Update `ProgramD2Repository` to discover richer organisation unit fields and available custom organisation unit attributes for the selected program scope.
- [x] 1.3 Extend preview-event mapping and template resolution inputs with the organisation unit values needed for the new tokens, including `fileExtension`.
- [x] 1.4 Refresh repository fixtures and unit tests to cover the new property groups, tokens, and resolved preview values.

## 2. Template Builder Behavior

- [x] 2.1 Reorder the template property catalog so file metadata renders first and includes the file extension token.
- [x] 2.2 Add the dedicated organisation unit section and rename/narrow the metadata section to event-oriented placeholders.
- [x] 2.3 Move the “Use tokens like …” copy below each textarea and restyle it as helper text.
- [x] 2.4 Update template validation/token parsing tests for the expanded token set and backward compatibility.

## 3. Wizard And Picker UX

- [x] 3.1 Improve `wizard-section` styling so template-step panels have clearer visual separation and spacing.
- [x] 3.2 Strengthen the active wizard-step-tab state and add `aria-current=\"step\"` for the selected step.
- [x] 3.3 Refactor `OrgUnitTreePicker` so the wrapped `OrganisationUnitTree` receives stable configuration across rerenders and no longer triggers the static-query warning.

## 4. Verification

- [x] 4.1 Update wizard and picker component tests to assert token ordering, helper-text placement, active-step semantics, and stable org unit tree behavior.
- [x] 4.2 Run the relevant test suite (`yarn test` targeted as needed) plus `yarn typecheck` to verify the change end to end.
