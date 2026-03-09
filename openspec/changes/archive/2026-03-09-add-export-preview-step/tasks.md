## 1. Wizard flow and navigation

- [x] 1.1 Reorder the wizard step sequence so template setup leads to preview and preview leads to storage.
- [x] 1.2 Update step labels, navigation controls, and persisted wizard state handling to match the new sequence without losing entered data.
- [x] 1.3 Add preview-step navigation gating so users can only continue to storage when preview data is loaded and no blocking errors exist.

## 2. Full export preview data preparation

- [x] 2.1 Extend the preview data flow to resolve every exportable selected file into a preview row with source file reference, resolved target filepath, and available size metadata.
- [x] 2.2 Compute aggregate preview statistics for total file count and total file size from the resolved preview rows.
- [x] 2.3 Detect duplicate resolved target filepaths in the preview preparation layer and expose both row-level conflicts and a step-level error state.

## 3. Preview step UI

- [x] 3.1 Update the preview step to render the full list of files to export with their computed target paths and file metadata.
- [x] 3.2 Surface aggregate stats and duplicate-path validation feedback in the preview UI, including guidance to revise the template when conflicts exist.
- [x] 3.3 Add the export configuration button to the preview step and present it as not yet implemented instead of generating a file.

## 4. Verification and regression coverage

- [x] 4.1 Add or update tests for the reordered wizard step flow and preview-to-storage navigation gating.
- [x] 4.2 Add or update tests for preview row resolution, aggregate stats calculation, and duplicate target filepath detection.
- [x] 4.3 Add or update UI tests for full preview rendering, duplicate error messaging, and the placeholder export configuration action.
- [x] 4.4 Run lint, typecheck, and relevant test suites; fix regressions related to the new preview behavior.
