Tasks: Implementation plan and checklist

Branch: fix/template-preview-multiple-dataelements

- [x] Fix the shared-pool slicing in quickPreviewByFileKey: moved `.slice(0, 10)` inside per-element loop
- [x] Update test data to cover cross-element scenarios: added split events under prog-a:ou-b
- [x] Update unit test assertions: added test for split events scenario
- [x] Verify round 1: typecheck, lint, and all 222 unit tests pass
- [x] Replace useProgramEventsPreview with useWizardExportPreview in useWizardTemplatePreviewData: reuse the per-element fetch+merge pattern so each data element gets its own filtered API call
- [x] Update tests to verify per-element API calls work correctly with the new hook
- [x] Verify round 2: Run yarn typecheck, yarn lint, and yarn test-unit
