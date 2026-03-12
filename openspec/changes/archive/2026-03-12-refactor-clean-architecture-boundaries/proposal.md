## Why

The current codebase claims Clean Architecture, but core export workflow logic is spread across `webapp/pages`, browser APIs are invoked from UI state containers, and several domain concepts are collapsed into broad files or generic utility modules. That mismatch is now large enough that adding storage methods, wizard steps, or domain rules will keep increasing coupling unless the boundaries are refactored deliberately.

## What Changes

- Refactor the export workflow into clearer domain, application, data, and web layers with explicit ownership for business rules, orchestration, infrastructure access, and presentation.
- Split overloaded entity and model files into focused files, following one entity or value object per file unless types are inseparable by design.
- Move wizard-agnostic shell and step-navigation UI out of `pages/wizard` into reusable component modules.
- Replace parameter-heavy wizard hooks and context actions with typed request objects, narrower controllers, and step-oriented adapters.
- Relocate non-page logic currently under `webapp/pages/wizard` such as execution planning, local directory access, report generation, and template/path resolution into more appropriate application, data, or shared modules.
- Introduce explicit architectural guardrails so browser APIs, HTTP details, and storage infrastructure do not bypass repository and use case boundaries.
- Reduce catch-all utility usage by extracting named domain/application services from `utils` and page-local helper files.

## Capabilities

### New Capabilities
- `clean-architecture-boundaries`: Defines enforceable module boundaries, ownership rules, and placement rules for domain/application/data/web concerns.
- `wizard-module-structure`: Defines how wizard UI, controllers, and reusable shell components are organized so page modules remain page-focused.

### Modified Capabilities
- `wizard-support-hooks`: Tighten requirements so wizard support modules expose cohesive step-oriented adapters instead of wide parameter lists and mixed infrastructure concerns.
- `local-directory-storage`: Clarify that local directory access is infrastructure behavior invoked through application-facing ports rather than page-local helpers.

## Impact

- Affected code spans `src/domain`, `src/data`, `src/webapp/pages/wizard`, `src/webapp/components`, `src/utils`, and `src/CompositionRoot.ts`.
- Primary risks are import churn, temporary duplication during migration, and test breakage around wizard execution, preview building, and storage validation.
- No intended user-facing feature removal, but some internal APIs and module paths will change substantially.
