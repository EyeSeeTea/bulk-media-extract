## Context

The template step is implemented in `WizardPage.tsx` with styling in `WizardPage.css`, token helpers in `templateBuilder.ts`, and property inspection in `ProgramD2Repository`. Today the property browser merges shared metadata into a single `Metadata` group, appends file metadata after the program-derived groups, and only resolves `orgUnitName`, `orgUnitId`, and `enrollmentDate` from preview events. The reusable `OrgUnitTreePicker` also wraps `OrganisationUnitTree` in a way that currently triggers the DHIS2 static-query warning during render.

This change crosses UI composition, normalized property inspection, template resolution, preview data loading, and component stability. A design document is useful because the user request mixes cosmetic adjustments with new placeholder capabilities that require additional data to be fetched and modeled.

## Goals / Non-Goals

**Goals:**
- Make the template builder easier to scan by moving file metadata to the top, separating organisation unit placeholders from event placeholders, and moving token guidance under the textarea as helper text.
- Introduce a file extension placeholder and richer organisation unit placeholders, including a stable token format for available custom org unit attributes.
- Keep the template preview and final export resolution consistent by extending the normalized preview/event model rather than adding UI-only tokens.
- Improve wizard section and step-tab styling while preserving the existing step order and validation flow.
- Remove the `OrganisationUnitTree` static-query warning without changing the picker’s single-selection behavior.

**Non-Goals:**
- Redesign the full wizard flow or alter validation semantics outside the current template-step issues.
- Introduce storage-provider changes or alter export execution contracts.
- Support arbitrary organisation unit metadata that cannot be resolved consistently from DHIS2 for both preview and execution.

## Decisions

### 1. Split “metadata” into explicit file, organisation unit, and event concerns

The current `metadata` grouping is too broad for template composition. The property catalog will be reorganized into:
- `fileMetadata` first
- `organisationUnit`
- `event`
- existing tracked entity / stage data element groups afterward

The core tokens will stay human-readable and backwards compatible where possible:
- Existing tokens remain valid: `{orgUnitName}`, `{orgUnitId}`, `{enrollmentDate}`, `{fileName}`, `{fileDataElementId}`, `{fileDataElementName}`, `{fileProgramStageId}`, `{fileProgramStageName}`, `{fileValueType}`
- New file token: `{fileExtension}`
- New org unit core tokens: `{orgUnitCode}`, `{orgUnitShortName}`, `{orgUnitPath}`, `{orgUnitLevel}` when data is available
- New org unit custom attribute tokens: `{orgUnitAttribute:<id>}`

Rationale:
- Users compose filenames from file metadata first, so file tokens should be encountered first.
- Organisation unit custom attributes need a namespaced token format to avoid collisions with tracked entity attributes and data elements.
- Keeping existing tokens valid avoids breaking saved templates.

Alternatives considered:
- Keep a single `Metadata` group and only reorder entries. Rejected because it does not solve the discoverability problem or provide a clear namespace for org unit attributes.
- Add display-only grouping in the UI while leaving the underlying normalized property model unchanged. Rejected because preview resolution and validation would drift from what the UI advertises.

### 2. Extend normalized preview data with organisation unit details instead of deriving them ad hoc in the UI

`ProgramEventPreview` will be extended to carry the organisation unit fields needed by the new tokens, plus resolved org unit custom attribute values. `ProgramD2Repository.getProgramEventsPreview()` already loads org unit names for preview rows; this change will expand that fetch so preview rows contain the same org unit data needed by template resolution and later execution configuration building.

Expected additions:
- core org unit values on preview events for code, short name, path, and level when present
- a map of custom org unit attribute values keyed by attribute id

Rationale:
- Template resolution already depends on `ProgramEventPreview`, so preview and exported path generation should read from one normalized source.
- The same data will be useful in the preview step and any later execution/reporting logic that displays resolved paths.

Alternatives considered:
- Fetch org unit details directly from the template step UI. Rejected because it duplicates repository logic and breaks clean architecture boundaries.
- Resolve org unit custom attributes only in the preview UI and not in the export path builder. Rejected because users would see tokens in preview that cannot be relied on during execution.

### 3. Discover org unit custom attributes from the program’s selectable organisation units

The property inspection path will inspect the selected program’s organisation units and expose a union of available custom org unit attributes for those units. Standard org unit fields will always be included when supported by the fetched metadata; custom attribute placeholders will be listed only when at least one program org unit exposes that attribute.

Implementation direction:
- expand the program/org unit metadata fetch to request the standard org unit fields needed for tokens
- load org unit attribute metadata alongside org unit values when available, preferring display names and falling back to ids
- cache org unit details by id in `ProgramD2Repository` to avoid repeated fetches between property inspection and preview loading

Rationale:
- The user specifically asked for “available custom attributes”, which implies capability discovery from the configured program scope rather than a hardcoded global list.
- Program-scoped discovery keeps the property browser relevant and avoids advertising tokens that are impossible to resolve for the selected program.

Alternatives considered:
- Query all organisation unit attributes globally. Rejected because it can expose irrelevant placeholders and creates a larger metadata surface than the current program-scoped UI needs.
- Show only standard org unit fields. Rejected because it would not satisfy the requested custom-attribute support.

### 4. Keep template input ergonomics simple and use existing helper-text styling

The “Use tokens like …” guidance will move below each textarea and use the existing helper-text styling with a less prominent tone. The two-column editor/property-browser layout remains, but `wizard-section` styling will be strengthened so filter, builder, and preview feedback blocks read as distinct panels. Wizard step tabs will gain a stronger active state via contrast, border, and/or indicator styling, and the active button should expose `aria-current=\"step\"`.

Rationale:
- This achieves the requested space optimization without changing the core step layout.
- `aria-current` makes the current step explicit for assistive tech and gives a clean hook for styling/tests.

Alternatives considered:
- Collapse the property browser into an accordion to save vertical space. Rejected because it changes the interaction model more than necessary.

### 5. Stabilize the org unit tree wrapper by isolating tree props from render churn

`OrgUnitTreePicker` will be refactored so the DHIS2 tree receives stable derived props and does not rebuild its query configuration on every render. The likely implementation is a memoized tree-config layer plus a memoized child renderer keyed only by the normalized program org unit scope, rather than by local selection churn.

Rationale:
- The fix should remove the runtime warning without changing the observable single-select behavior.
- Isolating the DHIS2 component from render churn is safer than relying on incidental parent prop identity.

Alternatives considered:
- Ignore the warning because selection still works. Rejected because it is noisy, indicates incorrect usage of the underlying DHIS2 component, and risks future breakage.

## Risks / Trade-offs

- [More org unit metadata requests] → Mitigation: cache org unit details by id and scope attribute discovery to the selected program’s organisation units.
- [Token surface grows and increases validation complexity] → Mitigation: update token validation patterns and template-builder tests in the same change, while keeping all existing tokens valid.
- [Some DHIS2 instances may not expose every requested org unit field or attribute label shape] → Mitigation: treat optional fields as capability-driven, only list resolvable placeholders, and fall back to ids for custom attribute labels when necessary.
- [Styling changes could cause snapshot/test churn] → Mitigation: anchor tests on behavior (`aria-current`, helper text placement, token ordering) rather than fragile visual markup.
- [The static-query warning may have more than one trigger] → Mitigation: cover the picker refactor with focused tests around prop stability and verify the warning is absent in component-level tests where feasible.

## Migration Plan

No data migration is required. Saved templates that use existing tokens remain valid. New tokens become available immediately after deployment; unresolved optional org unit tokens will resolve to empty strings when the backing data is unavailable. If the org unit metadata expansion causes unexpected DHIS2 compatibility issues, the change can be rolled back by restoring the prior property grouping and preview mapping logic without affecting persisted export records.

## Open Questions

- Which exact event/enrollment placeholders beyond `enrollmentDate` are consistently available and useful enough to expose in the new `Event` group? The implementation should confirm this from the current preview payload before adding more than date.
- Whether `fileExtension` should resolve without the leading dot. The proposed default is extension text only, so `report.pdf` yields `pdf`.
