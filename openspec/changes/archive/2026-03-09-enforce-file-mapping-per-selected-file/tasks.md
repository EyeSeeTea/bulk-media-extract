## 1. Step 1 File Selection Gate

- [x] 1.1 Locate step 1 file-selection state in the export wizard and expose a normalized selected-file key list for downstream steps.
- [x] 1.2 Add step 1 validation to block next-step navigation when no file dataValues are selected.
- [x] 1.3 Add/adjust step 1 UI validation messaging for the empty-selection case.

## 2. Step 2 Per-File Mapping Enforcement

- [x] 2.1 Implement `mappingByFileKey` state keyed by selected file identifiers and initialize it from step-1 selections.
- [x] 2.2 Render one mapping selector row per selected file and show missing-mapping feedback inline.
- [x] 2.3 Block step 2 navigation until every selected file has a valid mapping assignment.
- [x] 2.4 Keep mapping state synchronized when selected files change (remove stale keys, preserve unchanged keys).

## 3. File Metadata Property Catalog Expansion

- [x] 3.1 Extend the template property provider to include a file metadata group for the selected file context.
- [x] 3.2 Add `filename` plus additional DHIS2-provided file metadata placeholders when available.
- [x] 3.3 Ensure unavailable file metadata fields are omitted and do not generate invalid placeholders.
- [x] 3.4 Update template builder UI grouping labels so file metadata properties are discoverable in step 2.

## 4. Verification and Regression Coverage

- [x] 4.1 Add/update unit tests for step-1 empty file selection gating.
- [x] 4.2 Add/update unit tests for step-2 incomplete per-file mapping gating and mapping synchronization behavior.
- [x] 4.3 Add/update tests for file metadata placeholder catalog generation (minimum: filename + conditional fields).
- [x] 4.4 Run lint, typecheck, and tests; fix regressions related to wizard flow and template builder behavior.
