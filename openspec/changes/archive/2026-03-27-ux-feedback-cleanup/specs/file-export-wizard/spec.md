## MODIFIED Requirements

### Requirement: Wizard enforces step-level validation gates
The system MUST block step transitions and final execution when required fields are missing or invalid, including required file selection in step 1, required per-file mapping coverage in step 2, valid template input before preview, duplicate target filepaths in preview, and a successful validation of the currently selected storage method before execution.
The storage step MUST require the user to select a storage method before the wizard can advance.
When `WebDAV` is selected, the storage step MUST require the user to provide the WebDAV URL, username, and password, and MUST require a successful connection test using the currently entered values before the wizard can advance.
When `Local directory` is selected, the storage step MUST require the user to select and validate a destination directory before the wizard can advance.
When a step already renders its own specific warning or error notice that explains the validation issue (e.g. duplicate-path warning in preview, connection-error notice in storage), the wizard shell MUST suppress the generic "Validation required" banner for that step. The Next button MUST still be disabled regardless of whether the generic banner is shown.

#### Scenario: Missing required step data prevents transition
- **WHEN** the user attempts to continue with incomplete required fields
- **THEN** the system keeps the user on the current step and displays validation feedback for missing inputs

#### Scenario: No files selected in step 1 prevents transition
- **WHEN** the user attempts to continue from step 1 without selecting any file dataValue to sync
- **THEN** the system blocks progression and shows a validation error indicating at least one file must be selected

#### Scenario: Missing file mappings in step 2 prevents transition
- **WHEN** the user attempts to continue from step 2 and one or more selected files do not have a mapping
- **THEN** the system blocks progression and shows validation feedback for each selected file missing a mapping

#### Scenario: Invalid template prevents transition
- **WHEN** the user enters an invalid mapping template and clicks next
- **THEN** the system blocks progression and shows template validation errors

#### Scenario: Duplicate preview target filepath prevents transition
- **WHEN** the preview step contains two or more files with the same resolved target filepath and the user clicks next
- **THEN** the system blocks progression, highlights **all** rows that share each duplicate target path, and displays a warning notice that lists each conflicting path together with the event IDs and file data element names that produce it

#### Scenario: All duplicate rows are highlighted not just one
- **WHEN** two or more preview rows resolve to the same target filepath
- **THEN** every row sharing that duplicate path SHALL be visually highlighted with the duplicate warning style

#### Scenario: Duplicate warning notice lists conflicting paths with sources
- **WHEN** the preview step detects duplicate target filepaths
- **THEN** the warning notice SHALL display each conflicting target path and, for each path, list the event ID and file data element name of every row that produces it

#### Scenario: Storage step blocks progression until current WebDAV credentials are validated
- **WHEN** the user attempts to continue from the storage step with `WebDAV` selected before a successful connection test with the currently entered WebDAV URL, username, and password
- **THEN** the system blocks progression and instructs the user to test the connection successfully before continuing

#### Scenario: Storage step blocks progression until current local directory is validated
- **WHEN** the user attempts to continue from the storage step with `Local directory` selected before a successful directory validation
- **THEN** the system blocks progression and instructs the user to validate the selected local directory before continuing

#### Scenario: Editing validated WebDAV credentials clears the progression gate
- **WHEN** the user changes the WebDAV URL, username, or password after a successful connection test
- **THEN** the system clears the prior validated state and requires a new successful connection test before allowing progression

#### Scenario: Failed real WebDAV validation prevents progression
- **WHEN** the user runs the storage-step connection test with `WebDAV` selected and the real WebDAV validation request fails
- **THEN** the system keeps the storage step blocked from progressing and displays the validation failure result

#### Scenario: Generic validation banner is suppressed when step has inline notice
- **WHEN** a step has a validation error AND the step already renders a specific warning or error NoticeBox explaining the issue
- **THEN** the wizard shell does NOT render the generic "Validation required" banner, but the Next button remains disabled

#### Scenario: Generic validation banner is shown when step has no inline notice
- **WHEN** a step has a validation error AND the step does not render its own specific notice (e.g. missing program selection in preview step)
- **THEN** the wizard shell renders the generic "Validation required" banner as before

## MODIFIED Requirements

### Requirement: Wizard preview step exposes export configuration action
The system SHALL display an export configuration action in the preview step and MUST generate a JSON execution configuration from the current reviewed preview result when the user activates it.
The downloaded configuration MUST use the defined execution-configuration contract and MUST reflect the same reviewed preview rows and resolved targets currently visible in the preview step, excluding rows that are marked as skipped because they are missing `FileResource`.
Each exported operation's source URL MUST match the upstream-file endpoint for the detected DHIS2 version so the saved execution plan remains runnable against the same server version that produced the preview.
The export configuration button MUST be accompanied by an inline info-icon popover (using the `InfoIconPopover` component) that explains the purpose of the download and clarifies that import is not yet available.
The preview step MUST NOT display a standalone paragraph below the button to describe the export action.

#### Scenario: Preview shows export configuration button
- **WHEN** the user reaches the preview step
- **THEN** the system displays an export configuration button alongside the preview actions

#### Scenario: Export configuration button has an info-icon popover
- **WHEN** the user views the export configuration button in the preview step
- **THEN** an info icon is displayed next to the button, and clicking it reveals a popover explaining that the download is a JSON snapshot of the export plan and that import is not yet available

#### Scenario: Export configuration downloads as JSON
- **WHEN** the user activates the export configuration action after the preview has loaded
- **THEN** the system downloads a JSON file containing the execution configuration for the current reviewed preview result

#### Scenario: Export configuration excludes skipped rows
- **WHEN** the current preview contains rows that are visible warnings because their `FileResource` could not be resolved
- **THEN** the downloaded execution configuration omits those rows from its operations while preserving the reviewed exportable rows and skipped-row counts

#### Scenario: Export configuration preserves DHIS2 2.40 source URLs
- **WHEN** the current preview was generated against a DHIS2 2.40 server
- **THEN** each exported operation references the legacy `api/40/events/files` source URL for its row instead of the 2.41 Tracker file route

#### Scenario: No standalone help paragraph below export button
- **WHEN** the preview step renders the export configuration area
- **THEN** there is no paragraph element describing the export action below the button — help is only available via the info-icon popover

## ADDED Requirements

### Requirement: Preview step shows only the StepIntro description without a redundant body paragraph
The preview step MUST NOT render the "Preview the resolved export rows before continuing." paragraph. The StepIntro description MUST be the sole introductory text and SHALL read: "Review the resolved target paths and any warnings before continuing to storage and execution."

#### Scenario: No redundant preview paragraph is rendered
- **WHEN** the preview step loads with results
- **THEN** the step does not render a separate paragraph with "Preview the resolved export rows before continuing."

#### Scenario: StepIntro description is self-sufficient
- **WHEN** the user views the preview step
- **THEN** the StepIntro description reads "Review the resolved target paths and any warnings before continuing to storage and execution."

### Requirement: Preview step does not display event and page counts
The preview step MUST NOT render the "Matching events: X. Pages: Y." text. The files count and total size in the stats grid are sufficient.

#### Scenario: Event and page count text is absent
- **WHEN** the preview step renders the footer area
- **THEN** there is no text displaying "Matching events" or page counts

### Requirement: Preview table has a bounded height with sticky headers
The preview table wrapper MUST enforce a maximum height. When the table content exceeds that height, the wrapper MUST scroll vertically while keeping the table header row fixed at the top of the scrollable area.

#### Scenario: Table scrolls vertically for large file sets
- **WHEN** the preview table contains more rows than fit within the maximum height
- **THEN** the table wrapper scrolls vertically and the header row remains visible at the top

#### Scenario: Table does not scroll when content fits
- **WHEN** the preview table rows fit within the maximum height
- **THEN** no vertical scrollbar appears and the table renders at its natural height
