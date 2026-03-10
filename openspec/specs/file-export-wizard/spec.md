# file-export-wizard Specification

## Purpose
TBD - created by archiving change implement-wizard. Update Purpose after archive.
## Requirements
### Requirement: Wizard provides ordered export setup steps
The system SHALL provide a multi-step wizard that enforces a fixed order: scope selection, path/file naming template setup, preview, storage configuration, and execution.  
The path/file naming template setup step MUST expose a visual template builder with side-by-side editor and property browser.

#### Scenario: Wizard starts at first step
- **WHEN** the user opens the export wizard
- **THEN** the system displays the scope selection step as the first step

#### Scenario: User moves to next step after valid input
- **WHEN** the current step has all required valid values and the user clicks next
- **THEN** the wizard advances to the next configured step

#### Scenario: Preview step appears before storage
- **WHEN** the user completes the template setup step with valid input
- **THEN** the wizard advances to the preview step instead of the storage step

### Requirement: Wizard enforces step-level validation gates
The system MUST block step transitions and final execution when required fields are missing or invalid, including required file selection in step 1, required per-file mapping coverage in step 2, valid template input before preview, duplicate target filepaths in preview, and a successful validation of the currently selected storage method before execution.  
The storage step MUST require the user to select a storage method before the wizard can advance.  
When `WebDAV` is selected, the storage step MUST require the user to provide the WebDAV URL, username, and password, and MUST require a successful connection test using the currently entered values before the wizard can advance.  
When `Local directory` is selected, the storage step MUST require the user to select and validate a destination directory before the wizard can advance.

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
- **THEN** the system blocks progression, highlights the duplicate conflict, and instructs the user to revise the template

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

### Requirement: Wizard storage step supports selectable destination methods
The system SHALL present the storage step as a destination-method selection workflow instead of a fixed WebDAV-only form.  
The storage step MUST offer `WebDAV` and `Local directory` as selectable storage methods.  
The step MUST render only the setup controls and guidance relevant to the currently selected method, and it MUST allow the user to switch methods before execution.

#### Scenario: Storage step starts with method selection
- **WHEN** the user opens the storage step
- **THEN** the system displays storage-method choices for `WebDAV` and `Local directory` before the method-specific setup controls

#### Scenario: Selecting a storage method shows only relevant setup controls
- **WHEN** the user selects one storage method in the storage step
- **THEN** the system displays only that method's setup controls and guidance while hiding the inactive method's configuration form

#### Scenario: Switching storage methods does not trap the user
- **WHEN** the user changes the selected storage method after interacting with another method's setup controls
- **THEN** the system updates the visible setup panel to the newly selected method and allows the user to continue configuring that method in the same wizard session

### Requirement: Wizard preserves in-progress configuration across step navigation
The system SHALL preserve entered values while the user navigates backward or forward between steps in the same session.

#### Scenario: Back navigation retains data
- **WHEN** the user goes back to a previous step after entering later-step values
- **THEN** previously entered values remain populated

#### Scenario: Forward navigation retains corrected data
- **WHEN** the user fixes a validation error and continues
- **THEN** corrected values are retained in subsequent steps

### Requirement: Wizard executes export through existing export workflow
The system MUST trigger export execution using the reviewed configuration from the previous wizard steps and expose progress, interruption, and failures in the wizard UI.  
The execution step MUST be robust for large file lists by processing the reviewed export plan through controlled batch orchestration instead of a fire-and-forget launch action.  
The execution step MUST show clear progress reporting, including processed items versus total items, and MUST preserve a run summary that includes both successes and failures.  
The execution step MUST present `Processed` and `Progress` together as one summary pair and MUST present `Successes` and `Failures` together as one summary pair.  
The execution step MUST display a prominent progress bar only after export execution has started, and that progress bar MUST use animation to communicate active work while reflecting the best available progress approximation.  
The execution step MUST display an execution log only after export execution has started, and that log MUST be collapsed by default until the user expands it.  
Expanded execution-log entries MUST remain compact and the log region MUST have a bounded scrollable height for long runs.  
When execution finishes successfully, the completion notice MUST use a positive valid/success treatment and MUST expose the download-result-summary action from within that notice.  
The final execution step MUST replace the wizard-level `Next` action with a `Finish` action even before a concrete completion flow is implemented.  
Once execution finishes successfully, the execution step MUST stop showing the `Latest target path` helper label.

#### Scenario: Export starts from final step using reviewed configuration
- **WHEN** the user confirms execution on the final step with a valid reviewed configuration
- **THEN** the system starts export processing from that reviewed configuration and shows progress updates for the running batch

#### Scenario: Export failure is visible and recoverable
- **WHEN** export execution fails for one or more files
- **THEN** the system shows error details and allows the user to retry execution without re-entering unaffected configuration

#### Scenario: Execution step reports progress for large runs
- **WHEN** the reviewed export plan contains many files and execution is in progress
- **THEN** the system displays clear progress information including processed count, total count, current run state, the grouped summary indicators, and the prominent progress bar while the batch continues

#### Scenario: Execution progress UI stays hidden before start
- **WHEN** the user has not started export execution yet
- **THEN** the execution step does not display the progress bar or the execution log

#### Scenario: Execution log is available but collapsed after start
- **WHEN** the user starts an export run
- **THEN** the execution step displays an execution log control in a collapsed state by default and allows the user to expand it to inspect detailed activity

#### Scenario: Expanded execution log remains compact on long runs
- **WHEN** the user expands the execution log after many log entries have accumulated
- **THEN** the execution step shows compact log entries inside a bounded scrollable region instead of letting the log grow without limit

#### Scenario: Successful completion notice includes result-summary action
- **WHEN** an execution run finishes successfully
- **THEN** the execution step displays a positive completion notice and includes the download-result-summary action within that success feedback region

#### Scenario: Final step exposes finish action
- **WHEN** the user is on the execution step
- **THEN** the wizard footer displays a `Finish` action instead of `Next` as the end-of-flow affordance even if that action does not yet complete additional behavior

#### Scenario: Successful completion hides latest target path helper
- **WHEN** an execution run finishes successfully
- **THEN** the execution step no longer shows the `Latest target path` helper label

#### Scenario: User interrupts execution manually
- **WHEN** the user activates the execution-step interrupt action during a running export
- **THEN** the system stops scheduling further file transfers, marks the run as interrupted, and preserves the partial result summary collected so far

#### Scenario: User downloads execution result summary
- **WHEN** an execution run finishes, fails partially, or is interrupted
- **THEN** the system provides an action to download the execution result summary containing successes and failures for that run

### Requirement: Wizard preview step exposes export configuration action
The system SHALL display an export configuration action in the preview step and MUST generate a JSON execution configuration from the current reviewed preview result when the user activates it.  
The downloaded configuration MUST use the defined execution-configuration contract and MUST reflect the same reviewed preview rows and resolved targets currently visible in the preview step, excluding rows that are marked as skipped because they are missing `FileResource`.  
Each exported operation's source URL MUST match the upstream-file endpoint for the detected DHIS2 version so the saved execution plan remains runnable against the same server version that produced the preview.

#### Scenario: Preview shows export configuration button
- **WHEN** the user reaches the preview step
- **THEN** the system displays an export configuration button alongside the preview actions

#### Scenario: Export configuration downloads as JSON
- **WHEN** the user activates the export configuration action after the preview has loaded
- **THEN** the system downloads a JSON file containing the execution configuration for the current reviewed preview result

#### Scenario: Export configuration excludes skipped rows
- **WHEN** the current preview contains rows that are visible warnings because their `FileResource` could not be resolved
- **THEN** the downloaded execution configuration omits those rows from its operations while preserving the reviewed exportable rows and skipped-row counts

#### Scenario: Export configuration preserves DHIS2 2.40 source URLs
- **WHEN** the current preview was generated against a DHIS2 2.40 server
- **THEN** each exported operation references the legacy `api/40/events/files` source URL for its row instead of the 2.41 Tracker file route

### Requirement: Wizard storage step explains WebDAV scope and setup prerequisites
The system SHALL present WebDAV setup guidance when `WebDAV` is the selected storage method.  
The step MUST show a single setup notice that combines examples of WebDAV-compatible software, such as ownCloud and Nextcloud, with concise browser-side prerequisites for successful validation and export, including that the remote service must allow cross-origin requests from the application origin.  
The step MUST avoid redundant standalone scope or completeness notices when the same guidance is already communicated by the form structure, the setup notice, and the validation state feedback.

#### Scenario: User sees one consolidated WebDAV setup notice
- **WHEN** the user opens the storage step with `WebDAV` selected
- **THEN** the system displays one setup notice that mentions WebDAV-compatible software examples and the main validation prerequisites instead of splitting that guidance across separate introductory notices

#### Scenario: User can understand WebDAV infrastructure prerequisites from the step itself
- **WHEN** the storage step is visible with `WebDAV` selected
- **THEN** the system provides explanatory remarks that help the user understand why a valid server-side WebDAV setup and cross-origin access configuration are required before the connection test can succeed

#### Scenario: Incomplete WebDAV credentials do not trigger a redundant introductory notice
- **WHEN** the user has selected `WebDAV` but has not yet entered the WebDAV URL, username, and password
- **THEN** the system keeps the connection test unavailable without showing a separate introductory notice that only repeats the need to complete those fields

### Requirement: Wizard storage step explains local-directory scope and browser prerequisites
The system SHALL explain the local-directory method as a browser-local export destination.  
When `Local directory` is selected, the step MUST describe that the user will choose a folder on the local computer, that browser support for the required file-system APIs is mandatory, and that the selected folder access is limited to the current browser session.

#### Scenario: Local-directory guidance appears only for the local method
- **WHEN** the user selects `Local directory` in the storage step
- **THEN** the system displays setup guidance describing local folder selection, browser support expectations, and current-session access behavior

#### Scenario: WebDAV guidance is hidden while local-directory is selected
- **WHEN** the user selects `Local directory` in the storage step
- **THEN** the system does not display WebDAV-specific setup remarks that are irrelevant to the local-directory method

### Requirement: Wizard storage step validates local-directory readiness before execution
The system MUST require local-directory validation before the wizard can advance from the storage step when `Local directory` is the selected method.  
That validation MUST confirm that the browser supports the required local file-system APIs and that the user has selected a usable destination directory for the current session.

#### Scenario: Local-directory method blocks progression until a directory is selected and validated
- **WHEN** the user attempts to continue from the storage step with `Local directory` selected before completing local-directory validation
- **THEN** the system blocks progression and instructs the user to select and validate a destination directory first

#### Scenario: Changing the selected local directory clears prior local validation
- **WHEN** the user changes or reselects the destination directory after local-directory validation succeeded
- **THEN** the system clears the prior local validated state and requires validation of the current directory before allowing progression

### Requirement: Wizard storage test performs real WebDAV validation
The system MUST perform an actual validation request against the currently entered WebDAV endpoint when the user triggers the storage connection test with `WebDAV` selected.  
The system MUST NOT mark the WebDAV connection as valid based only on client-side field presence or URL-format checks.  
The system MUST report success only when the real validation request succeeds and MUST report failure when the request fails because of authentication, connectivity, protocol, or cross-origin access problems.

#### Scenario: Test connection issues a real WebDAV validation request
- **WHEN** the user clicks the storage-step test connection action after selecting `WebDAV` and entering URL, username, and password
- **THEN** the system sends a validation request using those current values and updates the UI from the request result

#### Scenario: Client-side checks alone cannot mark WebDAV valid
- **WHEN** the entered WebDAV values pass local field-completeness or URL-shape checks but the real WebDAV validation request fails
- **THEN** the system keeps the WebDAV method invalid and shows failure feedback instead of allowing progression

### Requirement: Wizard step navigation clearly identifies the current step
The system SHALL make the currently selected wizard step visually distinct from completed, available, and disabled upcoming steps. Each step tab MUST expose the step number before the step title, the active step tab MUST expose `aria-current="step"`, and completed valid steps MUST include a positive completion indicator such as a tick icon. The visual treatment MUST align with DHIS2-style blue-accented navigation rather than relying on generic neutral cards alone.

#### Scenario: Active step tab is explicitly marked
- **WHEN** the user is on any wizard step
- **THEN** the corresponding step tab is styled as the current step, exposes `aria-current="step"`, and presents its step number with stronger active emphasis than the other tabs

#### Scenario: Completed steps provide reassuring completion feedback
- **WHEN** the user has completed a valid step and advanced beyond it
- **THEN** the completed step tab remains visibly distinct from the active and upcoming steps and includes a completion indicator that reassures the user the step is done

#### Scenario: Disabled upcoming steps look unavailable
- **WHEN** the user has not yet unlocked a future step
- **THEN** that step tab appears visibly disabled and cannot be mistaken for the current or completed steps

### Requirement: Template step sections use clearer panel hierarchy
The system SHALL render template-step content in visually distinct sections so filters, template editing, and validation/preview feedback are easier to scan.

#### Scenario: Template step panels are visually separated
- **WHEN** the user opens the template step
- **THEN** filter controls, template builders, and preview/validation feedback each appear in clearly separated section panels

### Requirement: Wizard step content avoids repeating the active step title
The system SHALL rely on the step tabs to communicate the active step identity and MUST NOT display a redundant progress subtitle such as `Step X of Y: Title` above the step content. Step content MAY include its own concise intro title and support copy, but that intro MUST complement the shell hierarchy instead of reintroducing duplicate progress labeling.

#### Scenario: Progress subtitle is removed from the wizard shell
- **WHEN** the user opens any wizard step
- **THEN** the page does not render a `Step X of Y: Title` subtitle above the step tabs

#### Scenario: Step intro complements the shell instead of duplicating progress
- **WHEN** a step displays an internal title or support copy
- **THEN** that content guides the task within the step without repeating the shell-level progress label or conflicting with the step tab identity

### Requirement: Wizard program step presents a structured selection workflow
The system SHALL present Step 1 as a structured selection workflow with clear hierarchy between choosing a program and choosing file data values. The main interaction area MUST avoid stretching narrow form content across the full wizard width, the step MUST keep supporting metadata visually subordinate to the primary selection actions, and its intro treatment MUST stay consistent with the shared hierarchy used by later steps.

#### Scenario: Step 1 uses a constrained primary content area
- **WHEN** the user opens Step 1 of the wizard
- **THEN** the program selector and file-selection controls appear in a constrained primary content area instead of spanning the full available width

#### Scenario: Step 1 intro follows the shared wizard hierarchy
- **WHEN** the user opens Step 1 of the wizard
- **THEN** the step introduces the task with the same overall heading and support-copy rhythm used by the other wizard steps instead of a uniquely dominant hero block

#### Scenario: Step 1 shows supporting summary information separately
- **WHEN** the user selects a program in Step 1
- **THEN** the step displays concise supporting program information adjacent to the primary input controls without leaving excessive empty space between the two regions

#### Scenario: Program summary stays hidden until a program is selected
- **WHEN** no program has been selected in Step 1
- **THEN** the supporting summary card is not shown

### Requirement: Wizard program selector uses a filterable DHIS2 form control
The system SHALL render the Step 1 program selector using a DHIS2-native filterable select control so users can search within available file-capable programs.

#### Scenario: User searches within available programs
- **WHEN** the user focuses the Step 1 program selector
- **THEN** the selector provides a filterable DHIS2 selection experience for the available programs

#### Scenario: Program selection still updates the step state
- **WHEN** the user chooses a program from the filterable selector
- **THEN** the wizard updates the selected program and refreshes the Step 1 file-data-value choices for that program

### Requirement: Wizard file data values are presented as selection-first items
The system MUST present Step 1 file data values as explicit selectable items instead of a metadata-first table. Each item MUST emphasize the selection control and file data value name, while value type and program stage remain visible as secondary supporting metadata.

#### Scenario: User scans file data values without reading a table
- **WHEN** Step 1 loads file-capable data values for the selected program
- **THEN** the user sees them as selection-first items with compact supporting metadata rather than as rows in a multi-column table

#### Scenario: User toggles a file data value from its item container
- **WHEN** the user selects or deselects a file data value in Step 1
- **THEN** the item updates the selected file set used by later wizard steps

#### Scenario: Empty state remains clear when no file data values exist
- **WHEN** the selected program does not expose any file-capable data values
- **THEN** the step shows an empty state instead of rendering selectable items

### Requirement: Wizard displays friendly program type labels
The system SHALL present friendly program type labels in the UI instead of exposing raw DHIS2 program type codes. `WITH_REGISTRATION` MUST be shown as `Tracker Program`, and `WITHOUT_REGISTRATION` MUST be shown as `Event Program`.

#### Scenario: Wizard summary shows friendly tracker label
- **WHEN** the selected program type is `WITH_REGISTRATION`
- **THEN** the wizard displays `Tracker Program` wherever the program type is shown

#### Scenario: Wizard summary shows friendly event label
- **WHEN** the selected program type is `WITHOUT_REGISTRATION`
- **THEN** the wizard displays `Event Program` wherever the program type is shown

### Requirement: Wizard provides a prominent footer action bar
The system SHALL render wizard navigation actions inside a dedicated footer action bar that visually separates navigation from step content. The primary forward action MUST be visually prominent, and the back action MUST remain clearly available without being crowded against the page edge.

#### Scenario: Step actions are visually grouped and spaced
- **WHEN** the user views any wizard step
- **THEN** Back and forward actions appear in a dedicated footer region with clear spacing and alignment instead of as small buttons attached to the far left of the content area

#### Scenario: Footer actions remain usable on narrow layouts
- **WHEN** the wizard is rendered on a narrow viewport
- **THEN** the footer action bar adapts without clipping or obscuring the navigation actions

### Requirement: Wizard step content uses a consistent intro and section rhythm
The system SHALL present each wizard step with a consistent content hierarchy so titles, support copy, and section containers follow the same visual rhythm across the full flow. The step body MUST avoid giving one step an oversized hero treatment that is not matched by comparable framing in the other steps.

#### Scenario: Step 1 no longer dominates the flow with a unique oversized hero
- **WHEN** the user opens the wizard and compares Step 1 with later steps
- **THEN** Step 1 uses the same general intro hierarchy as the other steps instead of a uniquely oversized title block

#### Scenario: Page content ends with intentional breathing room
- **WHEN** the user reaches the end of a step with a long content body
- **THEN** the wizard layout keeps visible bottom padding below the final content and action area
