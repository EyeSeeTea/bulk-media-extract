## Context

The preview step (step 3) detects duplicate target filepaths by counting path occurrences in `buildExportPreviewRows` and marking rows with `hasDuplicateTargetPath: true`. The UI highlights these rows with a warning background and shows a `NoticeBox` with a count of conflicts.

Current issues:
1. The user reports that only one of two conflicting rows is highlighted. The detection logic in `PreviewBuilder.ts` looks correct (marks all rows with count > 1), so the bug may be in how rows are rebuilt or memoized — this needs investigation during implementation.
2. The `NoticeBox` only says "X target filepath conflicts were found" without listing which paths conflict or which events/data elements produce them.

## Goals / Non-Goals

**Goals:**
- Ensure all rows sharing a duplicate target path are visually highlighted.
- Show a detailed conflict breakdown in the duplicate warning notice: each conflicting path with the event IDs and file data element names that produce it.
- Enrich `ExportPreviewSummary` to carry structured per-path conflict details for UI rendering.

**Non-Goals:**
- Changing duplicate detection logic (the counting approach is correct).
- Auto-resolving conflicts or suggesting template fixes.
- Changing the blocking behavior (step already blocks on duplicates — that stays).

## Decisions

### Enrich `ExportPreviewSummary` with structured conflict details

Add a new field `duplicateTargetPathDetails` to `ExportPreviewSummary` that maps each conflicting path to the rows producing it:

```typescript
type DuplicateTargetPathDetail = {
    path: string;
    rows: Array<{
        eventId: string;
        fileDataValueName: string;
    }>;
};

type ExportPreviewSummary = {
    // ...existing fields...
    duplicateTargetPaths: string[]; // keep for backward compat (step validation uses it)
    duplicateTargetPathDetails: DuplicateTargetPathDetail[];
};
```

**Rationale:** Keeps the existing `duplicateTargetPaths` array for the step controller validation gate (which only needs a count), while adding structured details for the UI. Building details from rows in `summarizeExportPreview` avoids adding presentation concerns to `buildExportPreviewRows`.

### Render conflict list inside the NoticeBox

The `NoticeBox` body will render a list of conflicting paths, each with sub-items showing which event + data element produces it. Use a simple `<ul>` with `<code>` for paths and secondary text for event/data element info.

**Rationale:** Keeps it simple and scannable. No need for a separate modal or expandable section — the number of conflicts is typically small (< 10 paths).

### Investigate highlighting bug during implementation

The `buildExportPreviewRows` logic correctly marks all rows. The bug likely stems from either:
- A stale memoization boundary where rows are not recomputed when they should be.
- A CSS specificity issue where `wizard-preview-row-warning` overrides `wizard-preview-row-duplicate` on rows that are both missing a file resource and have a duplicate path.

Implementation should add a test that explicitly verifies both rows in a pair are marked and visually check the CSS cascade.

## Risks / Trade-offs

- [Long conflict lists in NoticeBox] → Cap the rendered list at ~10 paths with a "and N more" suffix. Unlikely to be needed in practice but prevents layout breakage.
- [Localization of conflict detail text] → Use `i18n.t` for labels; paths and IDs are not translated. Keep the template minimal.
