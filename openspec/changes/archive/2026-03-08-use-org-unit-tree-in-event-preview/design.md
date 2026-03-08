## Context

`EventPreview` currently uses a plain HTML `<select>` element to let users choose an organisation unit before triggering an event preview. This is inconsistent with the DHIS2 UI design system, which provides `OrganisationUnitTree` in `@dhis2/ui` for all org unit selections. Additionally, the selector shows all org units accessible to the user, not just those registered against the selected program, so a user can pick an org unit that will always yield zero results.

The selected program's org units are already available as metadata through `GetFileCapableProgramsUseCase` / `FileCapableProgram` (currently the entity only exposes `id`, `name`, `programType` — the program's org unit list needs to be added to the entity and use case to support filtering the tree).

## Goals / Non-Goals

**Goals:**
- Replace the `<select>` in `EventPreview` with `@dhis2/ui` `OrganisationUnitTree`
- Encapsulate the tree picker inside a reusable `OrgUnitTreePicker` component
- Constrain selectable org units to only those registered for the selected program

**Non-Goals:**
- Supporting multi-select org unit selection
- Changing the event preview query logic or pagination
- Modifying domain use cases beyond adding program org units to the entity

## Decisions

### D1 — New `OrgUnitTreePicker` wrapper component

Wrap `OrganisationUnitTree` from `@dhis2/ui` in `src/webapp/components/org-unit-tree-picker/OrgUnitTreePicker.tsx`.

**Rationale:** Encapsulates DHIS2-specific tree API (roots, selection format, filtering) behind a simple prop interface (`roots`, `selected`, `onChange`, `disabled`). Keeps `EventPreview` clean and makes `OrgUnitTreePicker` reusable elsewhere.

**Alternative considered:** Inline `OrganisationUnitTree` directly in `EventPreview`. Rejected because it mixes third-party details into a page component.

### D2 — Expose program org units on `FileCapableProgram`

Add `organisationUnits: NamedRef[]` to `FileCapableProgramAttrs` and populate it in `ProgramD2Repository` from the DHIS2 programs API response.

**Rationale:** `OrganisationUnitTree` requires an explicit set of roots, and selection must be constrained to program-assigned org units. This is the correct layer to carry that data.

**Alternative considered:** Fetch org units separately (extra API call). Rejected because the programs endpoint already returns `organisationUnits` — no extra round-trip needed.

### D3 — Pass program org units through `LandingPage` → `EventPreview`

`LandingPage` already holds `selectedProgramId` and `programsState`. It will derive the selected program's org units and pass them as a new prop to `EventPreview`.

**Rationale:** Keeps data flow top-down. `EventPreview` remains a presentational component.

### D4 — Restrict tree selection to program-assigned org units

Pass program org units as the `roots` prop to `OrganisationUnitTree`. Set `disableSelection` on nodes not in the program's org unit set using the `filter` or `singleSelection` API.

**Rationale:** `@dhis2/ui`'s `OrganisationUnitTree` accepts a `roots` array determining the displayed tree. Constraining roots to program org units is the simplest way to enforce the restriction without a custom filter function.

## Risks / Trade-offs

- **Risk**: DHIS2 programs may have a very large number of org units → Mitigation: `OrganisationUnitTree` lazily loads children; only root nodes are passed explicitly.
- **Risk**: `organisationUnits` field not returned by existing API call → Mitigation: Add `organisationUnits` to the `fields` list in `ProgramD2Repository`; no schema change.
- **Trade-off**: Users can only navigate the sub-tree rooted at program org units, losing visibility of the full hierarchy. Acceptable because the constraint is the desired behaviour.

## Migration Plan

1. Add `organisationUnits` to `FileCapableProgramAttrs` and update `ProgramD2Repository` + `ProgramTestRepository`.
2. Create `OrgUnitTreePicker` component.
3. Update `EventPreview` props to accept `programOrgUnits: NamedRef[]`; replace `<select>` with `OrgUnitTreePicker`.
4. Update `LandingPage` to derive and pass `programOrgUnits`.
5. Update tests.

No runtime data migration required; no API-breaking changes outside the internal composition.
