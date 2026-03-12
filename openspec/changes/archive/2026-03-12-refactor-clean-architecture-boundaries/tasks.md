## 1. Baseline And Guardrails

- [x] 1.1 Add characterization tests for wizard preview building, execution flow, local-directory validation, and execution report generation before moving modules
- [x] 1.2 Define the target package layout for domain, application, data/infrastructure, and web presentation modules
- [x] 1.3 Document temporary migration rules for imports, compatibility re-exports, and one-entity-per-file defaults

## 2. Domain And Contract Extraction

- [x] 2.1 Split collapsed domain types from `FileExportProgram.ts` into focused entity and value-object files
- [x] 2.2 Extract shared request/response contracts for export execution, preview building, and storage configuration into domain/application-owned modules
- [x] 2.3 Update repositories and use cases to consume the new focused domain contracts without changing behavior

## 3. Infrastructure Port Refactor

- [x] 3.1 Introduce application-facing ports for source file download, local directory access, destination writing, and report download/serialization
- [x] 3.2 Move WebDAV, browser filesystem, and fetch-based implementations out of `webapp/pages/wizard` into infrastructure/data modules
- [x] 3.3 Update `CompositionRoot.ts` to wire the new ports and adapters without leaking infrastructure decisions into React modules

## 4. Wizard Workflow Refactor

- [x] 4.1 Move generic wizard shell and shared step framing into `webapp/components`
- [x] 4.2 Refactor wizard controllers/support hooks to use typed request objects and concern-oriented return shapes instead of long parameter lists
- [x] 4.3 Reduce `WizardContent.tsx` and `WizardContext.tsx` to page composition and UI state coordination by moving orchestration and side effects into controllers/application services

## 5. Helper And Utility Cleanup

- [x] 5.1 Re-home `executionRunner`, `exportExecutionConfiguration`, `exportExecutionReport`, `templateBuilder`, `previewUtils`, and related helpers into named workflow or service modules
- [x] 5.2 Audit `src/utils` and `src/webapp/utils` and move non-generic logic into responsibility-specific modules
- [x] 5.3 Remove obsolete compatibility wrappers and dead helpers once all imports point to the new structure

## 6. Verification

- [x] 6.1 Update unit tests and integration tests to reflect the new module boundaries and controller contracts
- [x] 6.2 Run `yarn typecheck`, `yarn lint`, and targeted test suites for wizard, repositories, and domain/application modules
- [x] 6.3 Perform a final architecture review to confirm page folders contain page concerns only and infrastructure access no longer bypasses application boundaries
