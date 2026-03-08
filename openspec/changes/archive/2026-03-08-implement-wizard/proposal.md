## Why

The app has core export capabilities but lacks a guided workflow that lets implementers configure and run exports confidently end to end. Building a wizard now reduces setup errors and makes the feature usable for non-technical DHIS2 users.

## What Changes

- Add a multi-step file export wizard in the web app to guide users through configuration and execution.
- Introduce step-level validation and clear progression rules so users cannot run exports with incomplete or invalid settings.
- Persist wizard state during navigation so users can review and adjust prior steps before starting export.
- Connect the final step to existing export use cases and progress/error reporting.

## Capabilities

### New Capabilities
- `file-export-wizard`: Guided, step-by-step workflow for selecting program context, storage configuration, mapping templates, and export execution.

### Modified Capabilities
- `org-unit-event-preview`: Extend preview requirements to support wizard-based pre-export review context.

## Impact

- Affected code: `src/webapp/` pages/components/contexts, composition root wiring for wizard-facing use cases, and related domain use case integration points.
- APIs/systems: Reuses existing DHIS2 and storage provider integrations; no new backend service.
- Dependencies: No mandatory new external dependency expected; existing routing/state management may need incremental updates.
