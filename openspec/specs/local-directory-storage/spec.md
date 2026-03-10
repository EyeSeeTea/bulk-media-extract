# local-directory-storage Specification

## Purpose
Define browser-local export behavior for writing reviewed files into a user-selected directory on the local computer.

## Requirements
### Requirement: Local directory export writes reviewed files into the selected root folder
The system MUST allow browser-based export execution to write reviewed files into a user-selected local root directory.  
The system MUST preserve each reviewed operation's resolved relative target path under that selected root directory, including nested folders and filename resolution from the reviewed export plan.

#### Scenario: Export writes nested target paths under the selected directory
- **WHEN** execution runs with the `local-directory` storage method and a reviewed operation resolves to a nested target path
- **THEN** the system creates the necessary subdirectories under the selected root folder and writes the file to the resolved relative path

#### Scenario: Export writes sibling files into the same selected directory tree
- **WHEN** execution runs with multiple reviewed operations targeting different files under the same selected root directory
- **THEN** the system writes each file into the matching relative location without prompting the user to choose a new directory for every file

### Requirement: Local directory export validates browser capability and directory access before execution
The system MUST validate local-directory readiness before execution begins.  
Validation MUST include support for the required browser file-system APIs, explicit selection of a destination directory by the user, and the ability to obtain permission to create files in that directory for the current session.

#### Scenario: Supported browser and granted directory access allow execution readiness
- **WHEN** the user's browser supports the required local file-system APIs and the user selects a directory with usable write access
- **THEN** the system marks the local-directory storage method as ready for execution

#### Scenario: Unsupported browser blocks local-directory readiness
- **WHEN** the user selects the `local-directory` storage method in a browser that does not support the required local file-system APIs
- **THEN** the system keeps the method unavailable for execution and displays feedback explaining that local-directory export is not supported in that browser

#### Scenario: Missing or denied directory access blocks execution
- **WHEN** the user has not selected a destination directory or the browser denies the requested directory access
- **THEN** the system keeps the local-directory storage method invalid for execution and displays feedback describing the missing selection or permission failure

### Requirement: Local directory export reports per-file failures without losing completed writes
The system MUST preserve the existing per-file execution reporting model when writing to a local directory.  
Failures to create a subdirectory, open a writable file, or write file content MUST be reported against the affected operation while preserving already completed files in the selected directory.

#### Scenario: One failed file does not erase completed local writes
- **WHEN** execution to a local directory succeeds for some operations and then fails for a later operation
- **THEN** the system reports the later operation as failed while leaving the already written local files in place and preserving the partial execution summary
