## 1. Domain Entity Update

- [x] 1.1 Add optional `code` attribute to `ProgramFilePropertyAttrs` in `src/domain/entities/ProgramFileProperty.ts`

## 2. Property Building

- [x] 2.1 Populate `code` from DHIS2 data element metadata when building `ProgramFileProperty` instances in `ProgramD2Repository.ts` (both tracker and event program paths)
- [x] 2.2 Create `buildCurrentDataElementPropertyGroup()` in `TemplateBuilder.ts` that produces a "Current Data Element" group with `currentDataElementName` (always) and `currentDataElementCode` (conditional on any selected data element having a code)

## 3. Template Token Support

- [x] 3.1 Update `TEMPLATE_TOKEN` regex in `wizardConfig.ts` to recognize `currentDataElementName` and `currentDataElementCode`
- [x] 3.2 Add resolution logic for `currentDataElementName` and `currentDataElementCode` tokens in `resolveTemplateForEvent()` in `TemplateBuilder.ts`, sourcing values from `selectedFileProperty`

## 4. UI Integration

- [x] 4.1 Update `TemplateStep.tsx` to include the "Current Data Element" property group after the "Event" group in the visible property groups list

## 5. Verification

- [x] 5.1 Verify template validation accepts the new tokens and rejects malformed variants
- [x] 5.2 Verify template resolution correctly substitutes data element name and code in preview output
