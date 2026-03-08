## 1. Metadata and domain preparation

- [x] 1.1 Extend program property inspection models to expose grouped placeholder sections for tracker and event programs.
- [x] 1.2 Update repository/use case mapping so tracker output includes tracked entity sections plus program stage data elements, and event output includes event data elements plus shared metadata placeholders.
- [x] 1.3 Add unit tests for grouped property mapping across tracker, event, empty-state, and error scenarios.

## 2. Visual template builder UI

- [x] 2.1 Implement a visual builder component that renders template input and property browser side by side within the wizard template step.
- [x] 2.2 Implement cursor-aware placeholder insertion logic for property click actions in the active template input.
- [x] 2.3 Add inline template validation state handling with explicit invalid feedback and transition gating.

## 3. Quick preview integration

- [x] 3.1 Extend preview flow/use case to resolve valid templates against scoped sample events and limit results to the first 10 events.
- [x] 3.2 Render quick preview rows under the builder only when program/org-unit/date context and template validity requirements are satisfied.
- [x] 3.3 Add recoverable no-results and error UI states for quick preview without clearing current wizard selections.

## 4. Wizard wiring and regression safety

- [x] 4.1 Integrate the visual builder into existing wizard step state while preserving backward/forward data persistence behavior.
- [x] 4.2 Ensure step navigation and final execution remain blocked for invalid templates per wizard validation rules.
- [x] 4.3 Add integration tests covering tracker and event flows: grouped properties, insertion behavior, valid/invalid template gating, and first-10 quick preview rendering.
