## Why

The org unit tree picker has multiple bugs that break the selection experience: (1) the default org unit is an arbitrary leaf node instead of the hierarchy root, (2) the default-selected node is hidden because its parent nodes start collapsed, (3) clicking root or intermediate org unit nodes has no visible effect because their paths cannot be resolved, and (4) the component's internal `selectedPaths` state fights with the externally-controlled `selected` prop, causing unreliable visual updates.

## What Changes

- Fix `useWizardDefaultScope` to select the root org unit of the hierarchy (shortest path root segment) instead of the first arbitrary leaf node.
- Fix `OrgUnitTreePicker` to resolve paths for ALL nodes in the hierarchy (root, intermediate, and leaf) — not just program-assigned org units — so clicking any visible node correctly updates the selection.
- Replace the dual-state management pattern (`useState` + `useEffect`) with a derived `useMemo` for `selectedPaths`, eliminating the race condition between local and prop-driven state.
- Add `initiallyExpanded` prop to auto-expand the tree to show the default-selected org unit on mount.
- Add a custom `React.memo` comparator to prevent unnecessary re-renders caused by unstable `onChange` callback references from the parent.

## Capabilities

### New Capabilities

_None_

### Modified Capabilities

- `org-unit-tree-picker`: Fix path resolution for all hierarchy levels, derive selection state from prop, add initial expansion, and stabilize re-render behavior.

## Impact

- **Code**: `OrgUnitTreePicker.tsx` (selection state, path resolution, memo comparator, initial expansion), `useWizardDefaultScope.ts` (default org unit selection logic).
- **Dependencies**: No changes to external dependencies; relies on existing `@dhis2/ui` `OrganisationUnitTree` behavior.
- **Users**: Immediate UX improvement — root org unit selected by default, tree auto-expands to show it, and clicking any node works on the first click.
