## 1. Version-Aware Source URL Infrastructure

- [x] 1.1 Add DHIS2 server-version discovery during app bootstrap and expose the parsed version through shared app context.
- [x] 1.2 Centralize event-file URL generation behind a helper that selects the 2.40 legacy route or the 2.41+ Tracker route from the detected version.
- [x] 1.3 Update preview-row preparation and execution-configuration generation to consume the shared version-aware source URL helper instead of hardcoded `api/41` URLs.

## 2. Preview And Execution Flow Updates

- [x] 2.1 Update the preview step to render an `Original file` link inside the source filename cell for exportable rows only.
- [x] 2.2 Preserve missing-`FileResource` warning behavior while suppressing original-file links for non-exportable rows.
- [x] 2.3 Verify the execution runner continues downloading files from the preview-derived URLs without rebuilding route logic locally.

## 3. Test Coverage And Verification

- [x] 3.1 Update unit tests for preview URL generation to cover both DHIS2 2.40 and 2.41+ outputs.
- [x] 3.2 Update preview-step and execution-configuration tests to assert the original-file link behavior and version-aware exported source URLs.
- [x] 3.3 Run `yarn typecheck`.
- [x] 3.4 Run `yarn lint`.
- [x] 3.5 Run `yarn test -- previewUtils`.
- [x] 3.6 Run `yarn test -- WizardPage`.
