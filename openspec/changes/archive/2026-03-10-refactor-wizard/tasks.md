## 1. Shell And Step Decomposition

- [x] 1.1 Extract the shared wizard shell from `WizardPage.tsx`, including step navigation, validation framing, and footer actions.
- [x] 1.2 Move the program, template, preview, storage, and execution step UIs into dedicated component modules under `src/webapp/pages/wizard/`.
- [x] 1.3 Extract any shared step presentation primitives needed by multiple step modules, such as step intro or reusable summary sections.

## 2. Wizard Support Logic

- [x] 2.1 Extract step-specific derived state for program and template flows into wizard support hooks or controller modules.
- [x] 2.2 Extract preview shaping, duplicate-path diagnostics, and related step adapters into wizard support modules that wrap the existing helpers.
- [x] 2.3 Extract execution lifecycle orchestration and cleanup into a dedicated wizard support module while preserving the current `executionRunner` behavior.

## 3. Page Simplification And Verification

- [x] 3.1 Reduce `WizardPage.tsx` to provider bootstrap and top-level wizard composition using the new shell and step modules.
- [x] 3.2 Update wizard tests to cover the shell, extracted step modules, and support hooks/controllers without losing existing integration coverage.
- [x] 3.3 Run `yarn typecheck`, `yarn lint`, and the relevant wizard test suite, then fix any regressions introduced by the refactor.
