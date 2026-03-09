## Context

The wizard currently computes a full export preview before storage setup and already exposes an `Export configuration` control, but that control intentionally stops at a placeholder message. The next change needs two things at once: a stable JSON contract that can survive beyond the browser session, and a preview-step implementation that serializes the exact reviewed export plan without drifting from what the table shows.

Because the eventual import/execution flow will be implemented later, this change should define the configuration around a small, stable execution contract rather than UI concerns. The exported JSON must therefore be derived from the same preview rows used for review, filtered to only rows that are actually exportable, while keeping each operation limited to the specific fields the downstream runner expects.

## Goals / Non-Goals

**Goals:**
- Define a versioned export execution configuration format that can be generated from the preview step.
- Keep the configuration aligned with the preview the user reviewed, excluding rows that cannot be exported because they lack a resolved `FileResource`.
- Keep the per-operation payload intentionally minimal while still exporting the reviewed scope and summary metadata at the document level.
- Implement browser download of the configuration as JSON from the preview step.

**Non-Goals:**
- Importing a saved configuration back into the wizard.
- Executing exports directly from the exported JSON in this change.
- Capturing storage credentials or storage-provider-specific connection details inside the exported file, because the preview step happens before storage setup.

## Decisions

### Define a versioned document with top-level context plus `source` and `target` operations
The configuration should be a single JSON document with a schema version, generation timestamp, summary context for the selected export scope, and an `operations` array describing each exportable file. Each operation should include:
- `source.url` in the tracker file format `{baseUrl}/api/41/tracker/events/{eventId}/dataValues/{dataElementId}/file`, using the existing application/provider `baseUrl`.
- `source.fileResourceId`.
- `source.fileSize` when available.
- `target.path` as the resolved destination path reviewed in preview.

This keeps the execution contract narrowly scoped while preserving the destination data the runner still needs.

Alternative considered: flatten the operation to only `url`, `fileResourceId`, and `fileSize`. Rejected because the export runner still needs the destination path, and keeping `source`/`target` grouping makes that intent explicit without reintroducing the broader metadata payload.

### Build the configuration from the preview's exportable rows only
The configuration should be generated from the same prepared preview rows the table uses, after filtering to rows with resolved `FileResource` metadata. That preserves the user's reviewed export set and matches the current preview rule that missing-file-resource rows are visible warnings but not exportable.

Alternative considered: rebuild the export list from raw wizard selections during download. Rejected because it risks divergence from the visible preview and could accidentally include rows the preview already marked as skipped.

### Keep skipped-row information in document metadata, not in operations
Rows missing `FileResource` should not appear in the exported `operations` list, but the document should include summary counts such as `totalPreviewRows`, `exportableOperations`, and `skippedMissingFileResource`. This preserves fidelity with the preview and makes the omission explicit to downstream tools.

Alternative considered: include skipped rows in `operations` with an execution flag. Rejected because the user explicitly asked for the full preview list except those missing `FileResources`, and mixing non-executable rows into the execution array weakens the contract.

### Download via browser-generated JSON blob
The preview-step action should serialize the configuration to formatted JSON and trigger a browser download using a blob/object URL flow. The filename should be deterministic and traceable, using stable context such as program identifier and generation timestamp.

Alternative considered: request the server to generate the file. Rejected because all needed data already exists in browser state and no backend endpoint is required.

## Risks / Trade-offs

- [Configuration schema may evolve before import/execution is implemented] -> Mitigation: include an explicit `version` field and keep the initial contract focused on stable identifiers plus reviewed destination paths.
- [Preview row shape may not currently expose the exact tracker file URL inputs] -> Mitigation: centralize URL construction in preview utilities and feed it from the app's existing `baseUrl` instead of recomputing origin and DHIS base pieces locally.
- [Large previews can produce sizable JSON downloads] -> Mitigation: export only execution-relevant fields, exclude skipped rows from `operations`, and reuse already computed preview data instead of adding redundant nested structures.
- [Users may assume the JSON includes storage credentials or is directly executable today] -> Mitigation: name the file and UI copy around an execution configuration/export plan, and keep storage-target execution explicitly out of scope in this change.
