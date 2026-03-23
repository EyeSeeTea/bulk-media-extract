Proposal: Fix template preview for multiple dataElements

Summary

When more than one file-type dataElement is selected, the template preview returns empty results for all data elements. The root cause is that the preview slices a shared pool of 10 events before filtering per data element — events relevant to one data element may not be in that shared pool.

Why fix

- UX: Users expect the preview to show resolved examples for each selected file mapping.
- Correctness: The shared `.slice(0, 10)` pool applied before per-element filtering means that when multiple data elements are selected (especially across different program stages), the 10 events in the pool may not contain files for any given data element, resulting in empty previews for all.

Root cause

The bug is in `quickPreviewByFileKey` inside `useWizardTemplatePreviewData`. The code takes `quickPreviewEvents.slice(0, 10)` as a shared pool, then for each data element filters that pool by `event.fileNames[selectedFileProperty.id]`. When events from multiple stages are mixed and unfiltered, the first 10 events may not have files for any specific data element.

A prior attempt to fix this (passing `undefined` for `programStageId`/`fileDataElementId` when multiple elements are selected) broadened the API query but did not address the shared-pool slicing problem.

Proposed change

Move the `.slice(0, 10)` inside the per-element loop so each data element independently filters the full event list and then takes its own 10 best matches.

Acceptance criteria

- When a single file data element is selected, behavior unchanged.
- When multiple file data elements are selected, preview resolves and displays sample resolved templates for each selected file mapping.
- Existing unit tests continue to pass; new tests cover the multi-dataElement case.
- Typechecking, lint and unit tests pass.
