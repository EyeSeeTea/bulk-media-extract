## 1. Fix selection state derivation in OrgUnitTreePicker

- [x] 1.1 Replace `selectedPaths` useState + useEffect with a useMemo that derives selectedPaths from the `selected` prop and `pathByOrgUnitId` map
- [x] 1.2 Remove `setSelectedPaths` call from the `onChange` handler — keep only the parent `onChange` callback invocation
- [x] 1.3 Build `pathByOrgUnitId` from all hierarchy levels (root, intermediate, leaf) by extracting every path segment, not just program org units

## 2. Stabilize re-render behavior

- [x] 2.1 Add custom `arePropsEqual` comparator for `React.memo` that compares `programOrgUnits` by content signature and skips `onChange` comparison
- [x] 2.2 Extract `buildScopeSignature` helper for reuse in both comparator and internal memo

## 3. Add initial tree expansion

- [x] 3.1 Pass `initiallyExpanded` with the default-selected org unit path so the tree auto-expands on mount

## 4. Fix default org unit selection

- [x] 4.1 Update `useWizardDefaultScope` to select the hierarchy root (first path segment of shortest path) instead of `organisationUnits[0]`

## 5. Verify behavior

- [x] 5.1 Verify root org unit is selected by default when a program is chosen
- [x] 5.2 Verify tree auto-expands to show the default-selected org unit
- [x] 5.3 Verify single click on root, intermediate, and leaf nodes all update the selection
