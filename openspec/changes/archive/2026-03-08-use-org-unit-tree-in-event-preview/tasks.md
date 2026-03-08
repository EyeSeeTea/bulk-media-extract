## 1. Domain — Add org units to FileCapableProgram

- [x] 1.1 Add `organisationUnits: NamedRef[]` field to `FileCapableProgramAttrs` in `FileExportProgram.ts`
- [x] 1.2 Update `ProgramD2Repository` to include `organisationUnits` in the API fields request and map them to `NamedRef[]`
- [x] 1.3 Update `ProgramTestRepository` fixtures to include `organisationUnits`
- [x] 1.4 Update existing unit tests that construct `FileCapableProgram` to include `organisationUnits`

## 2. New Component — OrgUnitTreePicker

- [x] 2.1 Create `src/webapp/components/org-unit-tree-picker/OrgUnitTreePicker.tsx` wrapping `OrganisationUnitTree` from `@dhis2/ui`
- [x] 2.2 Accept props: `roots: NamedRef[]`, `selected: string`, `onChange: (id: string) => void`, `disabled?: boolean`
- [x] 2.3 Add unit test `OrgUnitTreePicker.spec.tsx` covering: renders roots, emits selection, respects disabled state

## 3. Update EventPreview

- [x] 3.1 Add `programOrgUnits: NamedRef[]` prop to `EventPreview`
- [x] 3.2 Replace the `<select>` element and `orgUnitsState` loading/error handling with `OrgUnitTreePicker`
- [x] 3.3 Pass `programOrgUnits` as `roots` to `OrgUnitTreePicker`; disable when no program is selected
- [x] 3.4 Remove the `orgUnitsState: AsyncData<NamedRef[]>` prop from `EventPreview` (no longer needed)
- [x] 3.5 Update `EventPreview.spec.tsx` tests to reflect new props and tree-based selection

## 4. Update LandingPage

- [x] 4.1 Derive `programOrgUnits` from `programsState` and `selectedProgramId` in `LandingPage`
- [x] 4.2 Remove `orgUnitsState` from `EventPreview` usage and pass `programOrgUnits` instead
- [x] 4.3 Remove `useOrganisationUnits` hook usage from `LandingPage` if no longer needed elsewhere
- [x] 4.4 Update `LandingPage.spec.tsx` tests to reflect removed org unit loading

## 5. Verify & Clean Up

- [x] 5.1 Run `yarn typecheck` and resolve any type errors
- [x] 5.2 Run `yarn test` and ensure all tests pass
- [x] 5.3 Run `yarn lint` and fix any lint issues
