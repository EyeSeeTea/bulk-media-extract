## Context

The current export workflow mixes presentation, orchestration, domain modeling, and infrastructure details in the same areas of the tree. Examples confirmed in the codebase include:

- `src/webapp/pages/wizard/WizardContent.tsx` coordinating step routing, validation gates, state normalization, and hook composition.
- `src/webapp/pages/wizard/WizardContext.tsx` invoking storage validation and browser directory selection directly from a UI context.
- `src/webapp/pages/wizard/hooks/useWizardExecutionController.ts` calling `fetch`, WebDAV upload use cases, local file writing, and report downloads from one React hook.
- `src/webapp/pages/wizard/localDirectoryStorage.ts` and `src/webapp/pages/wizard/exportExecutionConfiguration.ts` containing infrastructure and application logic inside a page folder.
- `src/domain/entities/FileExportProgram.ts` grouping multiple domain concepts in one file, which hides the real domain surface area.
- `src/data/repositories/ProgramD2Repository.ts` containing a large amount of remote mapping, caching, enrichment, and pagination behavior in one repository class.

The refactor must preserve current user-visible behavior while making module ownership explicit enough that new storage providers, export rules, and wizard changes can be added without further page-layer coupling.

## Goals / Non-Goals

**Goals:**

- Re-establish clear ownership boundaries between domain, application, data, and web layers.
- Make the export workflow readable in terms of use cases and controllers rather than page-local helper chains.
- Split overloaded entity, model, and helper files into focused modules with stable names.
- Move reusable wizard shell UI into `webapp/components` and keep page folders page-focused.
- Introduce request/response objects for complex hook and use case inputs to reduce positional-parameter APIs.
- Create an incremental migration path that keeps the app working while modules move.

**Non-Goals:**

- Redesign the wizard UX or change the current feature set.
- Replace Futures with Promises across the project.
- Rewrite every repository or utility module in one pass.
- Introduce a DI framework or runtime plugin system.

## Decisions

### Decision: Introduce an application layer distinct from domain and web

Create an explicit application layer for workflow orchestration, commands, and DTO-like request objects. Domain remains business-model focused. Web consumes application controllers/adapters instead of composing infrastructure details directly.

Rationale:

- Current “anemic use cases” are mostly pass-through wrappers because orchestration leaked upward into React hooks and page helpers.
- Moving orchestration into application services allows use cases to stay small without being meaningless.

Alternatives considered:

- Keep the existing `domain/usecases` pattern and only rename folders. Rejected because it preserves the current layering confusion.
- Move orchestration into React hooks only. Rejected because hooks remain web-layer constructs and do not solve portability or testability.

### Decision: Treat browser APIs and remote APIs as infrastructure behind ports

Browser filesystem access, `fetch` downloads, WebDAV uploads, and report download side effects will be owned by infrastructure/data modules behind interfaces consumed by application services.

Rationale:

- `WizardContext` and `useWizardExecutionController` currently bypass architectural boundaries by touching browser and transport APIs directly.
- This also makes local-directory storage and future S3-like providers fit the same execution flow.

Alternatives considered:

- Keep browser APIs in page helpers for convenience. Rejected because page-local infra keeps spreading.
- Put browser-specific logic in domain services. Rejected because the domain must stay framework-agnostic.

### Decision: Split wizard code into page, components, controllers, and workflow modules

`webapp/pages/wizard` should contain route/page composition only. Generic shell UI moves into `webapp/components/wizard`. Wizard-specific derived state and command handlers move into dedicated controller/hooks modules. Pure workflow logic moves into application/shared modules outside the page folder.

Rationale:

- The current page folder contains route components, execution models, template resolution, filesystem access, report downloads, and tests for all of them.
- Reusable shell and navigation primitives are already effectively generic, but their placement hides that fact.

Alternatives considered:

- Keep all wizard-related code together under `pages/wizard`. Rejected because “same feature” is not enough when the folder becomes a full stack in miniature.

### Decision: Replace wide parameter lists with typed request objects

Hooks and use cases with many positional parameters will accept typed objects. Returned values should be grouped by concern, for example `state`, `actions`, and `derived`.

Rationale:

- `useWizardExportPreview` and other wizard support hooks are hard to read and easy to misuse.
- Request objects make migrations easier because fields can be added without rewriting call sites mechanically.

Alternatives considered:

- Keep positional parameters and rely on comments/types. Rejected because this does not reduce cognitive load.

### Decision: Split collapsed domain types into focused files and introduce value objects where helpful

Separate program, file property, preview event, preview result, export operation, and storage configuration concepts into individual files unless the types are inseparable.

Rationale:

- The project appears to have “few entities” partly because multiple entities and values are compressed into `FileExportProgram.ts`.
- Smaller files reveal the actual model and make invariants easier to place.

Alternatives considered:

- Preserve large domain files for fewer imports. Rejected because it trades short import lists for long-term opacity.

### Decision: Shrink catch-all utilities by promoting named services

Logic in `templateBuilder.ts`, `previewUtils.ts`, `executionSupport.ts`, and generic `utils` modules should be evaluated and moved into explicit domains such as template resolution, preview mapping, execution reporting, or shared presentation helpers.

Rationale:

- Utility folders and page helper files currently act as overflow for logic that lacks a clear home.
- Naming a module by responsibility is itself an architectural guardrail.

Alternatives considered:

- Keep helpers in place and only document usage rules. Rejected because undocumented gravity will keep pulling more code there.

## Risks / Trade-offs

- [Import churn and merge friction] → Mitigate by migrating module-by-module with compatibility re-exports only where temporary bridging is necessary.
- [Specifying boundaries too rigidly] → Mitigate by allowing narrowly justified exceptions for inseparable value types or feature-local presentation helpers.
- [Refactor pauses feature work] → Mitigate by sequencing around stable slices: entities and contracts first, then wizard controllers, then infrastructure extraction.
- [Regression risk in execution flow] → Mitigate with characterization tests around preview building, execution planning, local directory validation, and report generation before moving logic.
- [Application layer becomes another dump zone] → Mitigate by defining ownership rules: orchestration only, no browser APIs, no HTTP response shaping, no JSX.

## Migration Plan

1. Create the target package structure and naming conventions without changing behavior.
2. Split domain entities/value objects and update imports with minimal behavioral changes.
3. Extract infrastructure ports and adapters for file download, local directory access, WebDAV upload, and report download.
4. Move wizard workflow logic into application services/controllers and simplify page/context modules to composition only.
5. Relocate generic wizard shell components into shared components and keep wizard pages focused on route assembly.
6. Remove temporary compatibility exports and delete obsolete catch-all helpers once call sites are migrated.

Rollback strategy:

- The change is code-structure only, so rollback is a normal source revert if an intermediate slice proves unstable.
- Each migration slice should remain releasable and testable before the next one starts.

## Open Questions

- Should the new application layer live as `src/application` or should current `domain/usecases` be split into `domain` and `application` subtrees?
- How much of the current `wizardConfig` state model belongs in domain/application value objects versus web-only view state?
- Should report download stay a web adapter or be modeled as an application serializer with a thin DOM-trigger wrapper?
- Do we want lint-level import boundary rules now, or only directory conventions plus review discipline in this refactor?
