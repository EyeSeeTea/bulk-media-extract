## Context

The export wizard currently allows users to move through setup without explicitly binding each selected file dataValue to a mapping in the template step. This creates ambiguity during export because the configuration does not guarantee a deterministic mapping source for every file.  
The change touches wizard step validation, step data contracts, and property catalog composition in the template builder.

## Goals / Non-Goals

**Goals:**
- Require users to select at least one file dataValue in step 1 before they can proceed.
- Require users to assign a mapping entry for every selected file in step 2 before they can proceed.
- Expand step 2 property catalog with file-scoped metadata placeholders (filename plus supported DHIS2 file metadata fields).
- Keep behavior consistent for tracker and event programs.

**Non-Goals:**
- Changing storage provider behavior or upload transport.
- Redesigning the overall wizard navigation structure.
- Introducing new template syntax semantics beyond adding new placeholders.

## Decisions

### 1. Add explicit selected-file state as a first-class wizard input
Step 1 will produce a normalized list of selected file dataValue descriptors (stable key + label + source metadata). The next button is disabled and validation is shown when this list is empty.  
This keeps enforcement in the existing step-gating model and avoids deferring errors to later steps.

Alternative considered:
- Allow advancing and validate only at final execution. Rejected because users would discover errors too late and step 2 would not have clear mapping targets.

### 2. Represent mapping assignments as a per-file keyed structure
Step 2 will maintain `mappingByFileKey` keyed by step-1 selected file keys. Transition to step 3 requires every selected key to have a non-empty valid mapping selection.  
The UI will render one mapping selector row per selected file, making missing mappings visible and actionable.

Alternative considered:
- Single global mapping reused for all files. Rejected because the requirement is explicit per-file mapping and different files often need distinct destination patterns.

### 3. Extend property catalog with file metadata placeholder group
The template property provider will append file-related placeholders for the active file context (e.g., filename, content type, file size, file resource id, storage domain when available from DHIS2 metadata).  
Fields are included only when resolvable from inspected program/file metadata; unavailable fields are omitted to prevent invalid placeholders.

Alternative considered:
- Hardcode only `filename`. Rejected because DHIS2 file metadata can provide additional useful attributes and the request explicitly asks to include any available file properties.

### 4. Reuse existing wizard validation surface
Validation messages for empty file selection and incomplete mapping coverage will use the existing per-step error presentation and transition blocking mechanism.  
This minimizes UI churn and test surface while preserving consistent behavior with existing template validation.

## Risks / Trade-offs

- [Risk] Some DHIS2 instances may not expose all desired file metadata fields consistently.  
  Mitigation: make file metadata placeholder generation capability-driven (show only resolvable fields) and keep `filename` as baseline.
- [Risk] Users may need to re-map when going back and changing step-1 selections.  
  Mitigation: prune stale mappings for removed files and preserve mappings for unchanged keys.
- [Risk] Additional per-file mapping rows can increase complexity for large selections.  
  Mitigation: keep rows lightweight and use clear completion feedback (mapped count vs total).

## Migration Plan

No data migration is required. The change is forward-compatible within the current wizard session model.  
Rollback: revert the wizard step-gate conditions and property catalog extension to restore current behavior.

## Open Questions

- Which exact DHIS2 file metadata fields are available across all supported API versions and should be considered stable placeholders?
- Should step 2 include a bulk action (copy mapping to all) for large selections, or keep strict one-by-one assignment in this change?
