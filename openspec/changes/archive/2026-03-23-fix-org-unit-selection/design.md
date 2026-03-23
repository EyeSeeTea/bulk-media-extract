## Context

The `OrgUnitTreePicker` component wraps `@dhis2/ui`'s `OrganisationUnitTree`. The program's org units are leaf nodes in the DHIS2 hierarchy (e.g., `/root/region/district`). The tree renders the common ancestor as the root node, with program org units as descendants. The tree starts with all nodes collapsed.

Three interacting issues:

1. **Wrong default selection**: `useWizardDefaultScope` picked `organisationUnits[0]` — an arbitrary leaf, not the hierarchy root.
2. **Missing path resolution**: `pathByOrgUnitId` only mapped leaf org unit IDs to paths. Root and intermediate nodes (visible and clickable in the tree) had no path mapping, so clicking them produced `selectedPaths: []`.
3. **Dual state management**: `selectedPaths` was both local state (set in `onChange`) and effect-synced from the `selected` prop, causing race conditions. Additionally, `React.memo`'s shallow comparison was defeated by an unstable inline `onChange` callback from the parent, triggering unnecessary re-renders that caused the DHIS2 tree's non-memoized `filterRootIds` to recreate its internal data query.

## Goals / Non-Goals

**Goals:**
- Root org unit is selected by default when a program is chosen.
- Default-selected org unit is visible (tree auto-expands to its path).
- Clicking any visible node (root, intermediate, or leaf) updates the selection on a single click.
- Minimize unnecessary re-renders to reduce DHIS2 static-query warnings.

**Non-Goals:**
- Patching the DHIS2 `OrganisationUnitTree` component's internal non-memoized `filterRootIds`.
- Adding multi-selection support.

## Decisions

### Select the hierarchy root as default

**Decision**: In `useWizardDefaultScope`, find the root org unit by extracting the first path segment from the shortest org unit path, instead of taking `organisationUnits[0]`.

**Rationale**: The program's org units are leaves at varying depths. The first path segment is the hierarchy root that contains all program org units. This is the most useful default when combined with `orgUnitSelectionMode: "descendants"`.

### Build path map for all hierarchy levels

**Decision**: In `OrgUnitTreePicker`, construct `pathByOrgUnitId` by extracting every segment from each org unit path (root, intermediate, and leaf), not just the leaf org units in `programOrgUnits`.

**Rationale**: The DHIS2 tree renders and allows clicking on ALL nodes in the visible hierarchy. The `onChange` payload returns the clicked node's ID regardless of whether it's in `programOrgUnits`. Without a path mapping, `selectedPaths` resolves to `[]` and the tree shows nothing selected.

### Derive selectedPaths from prop via useMemo

**Decision**: Replace `useState` + `useEffect` synchronization with a `useMemo` that derives `selectedPaths` directly from the `selected` prop and `pathByOrgUnitId`.

**Rationale**: Eliminates the dual source of truth. Selection flows unidirectionally: click → parent `onChange` → parent state update → re-render with new `selected` prop → `useMemo` recomputes `selectedPaths`. No local state to race against.

### Custom React.memo comparator

**Decision**: Add a custom `arePropsEqual` function that compares `programOrgUnits` by content (via `buildScopeSignature`) and skips `onChange` comparison.

**Rationale**: The parent passes `onChange` as an inline arrow function (new reference every render). Default `React.memo` shallow comparison fails, causing the component to re-render on every parent state change. The DHIS2 tree internally calls `filterRootIds(filter, roots)` without memoization on every render, recreating its data query. The custom comparator prevents these unnecessary re-renders.

### Add initiallyExpanded for default selection visibility

**Decision**: Pass `initiallyExpanded={selectedPaths}` (memoized on scope change) to the DHIS2 tree so it auto-expands parent nodes to reveal the default-selected org unit.

**Rationale**: The tree starts fully collapsed. The default-selected org unit may be at depth 2+ in the hierarchy. Without `initiallyExpanded`, the user must manually expand parent nodes to see the selection. The DHIS2 tree's `initiallyExpanded` prop uses `useState` initialization, so it only takes effect on first mount — which is the correct behavior for the default selection.

## Risks / Trade-offs

- **[DHIS2 static-query warning persists on selection change]** → The DHIS2 tree's internal `filterRootIds` is not memoized. When `selected` changes (legitimate re-render), the tree recreates its query. The `@dhis2/app-runtime` data engine serves cached data, so no actual refetch occurs. The warning is cosmetic. Mitigation: custom memo comparator eliminates all OTHER re-render sources; the warning only fires on actual selection changes.
- **[Root org unit may not be a program org unit]** → The hierarchy root (e.g., IHQ) is rendered by the tree but may not be in the program's `organisationUnits` list. With the path map fix, selecting it now works and produces meaningful results when combined with "descendants" mode.
