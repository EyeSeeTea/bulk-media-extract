## ADDED Requirements

### Requirement: Layer ownership SHALL be explicit and enforced by module placement
The system SHALL organize export workflow code so each module belongs clearly to one of these layers: domain, application, data/infrastructure, or web presentation. Domain modules MUST remain framework-agnostic and MUST NOT import browser APIs, React modules, or DHIS2 transport clients. Web modules MUST NOT implement business orchestration or infrastructure access directly when an application or data module can own that behavior.

#### Scenario: Browser and transport concerns stay out of domain
- **WHEN** a developer adds or changes a domain entity, value object, or domain service
- **THEN** that module does not import React, `window`, `document`, `fetch`, WebDAV clients, or DHIS2 API client types

#### Scenario: Presentation modules delegate workflow orchestration
- **WHEN** a page component, React context, or presentation hook needs to run export workflow behavior
- **THEN** it delegates to application-facing controllers or use cases instead of directly combining storage access, download transport, and domain mapping logic

### Requirement: Focused modules SHALL replace collapsed domain and helper files
The system SHALL represent distinct domain concepts and workflow responsibilities with focused modules. A single file MUST NOT group unrelated entities, value objects, execution models, or helper services merely for convenience. One entity or value object per file SHALL be the default, except where two types are inseparable and documented as such.

#### Scenario: Domain concepts remain discoverable
- **WHEN** a developer looks for the model representing a specific concept such as a program file property, preview event, or export operation
- **THEN** that concept is defined in a focused file named after the concept instead of being hidden in a large aggregate file

#### Scenario: Catch-all helpers are replaced by named responsibilities
- **WHEN** shared logic is reused across features
- **THEN** it is placed in a module named for its responsibility such as template resolution, execution reporting, or preview mapping rather than a generic catch-all utility location

### Requirement: Infrastructure SHALL be consumed through application-facing ports
The system SHALL expose storage upload, source download, local directory access, and comparable side effects through interfaces or adapters consumed by application services. Browser or transport implementations MUST live outside page modules and MUST be swappable without rewriting wizard presentation components.

#### Scenario: Local directory execution uses an adapter
- **WHEN** the export workflow writes files to a local directory
- **THEN** the application execution flow invokes a local-directory adapter or repository instead of importing a page-local helper directly

#### Scenario: Remote download uses an adapter
- **WHEN** the export workflow needs to download the source file payload before upload or write
- **THEN** the execution flow uses a dedicated adapter or port rather than issuing `fetch` directly from a presentation hook
