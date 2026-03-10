## Step 1 Review

### Current UI observations

- The current Step 1 combines a narrow form task with a full-width content area, which weakens the visual hierarchy.
- The native program selector is functional but not ideal for long file-capable program lists.
- The file selection table reads like a report, so the main action of selecting file fields is visually diluted by metadata columns.

### Proposed direction

- Constrain the primary Step 1 content width and separate supporting program context into a secondary summary region.
- Use a filterable DHIS2 `SingleSelectField` for program selection.
- Replace the table with selection-first items so the checkbox and file name lead, while value type and program stage remain visible as supporting metadata.

### Review assets

- Local review harness: [openspec-program-step-review.tsx](/home/m/Documentos/eyeseetea/file-export/openspec/changes/improve-program-step-ui/review-assets/openspec-program-step-review.tsx)
- Local review page entry: [openspec-program-step-review.html](/home/m/Documentos/eyeseetea/file-export/openspec/changes/improve-program-step-ui/review-assets/openspec-program-step-review.html)

### Tooling note

Playwright CLI session startup was attempted against `http://localhost:8081/` using a named persistent session, but the browser daemon exited immediately in this environment before a screenshot could be persisted. The change proposal is therefore based on the current Step 1 implementation plus the local review mock assets above.
