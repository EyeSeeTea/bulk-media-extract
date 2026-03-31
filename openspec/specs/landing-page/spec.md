# landing-page Specification

## Purpose
TBD - created by archiving change landing-page. Update Purpose after archive.
## Requirements
### Requirement: Landing page serves as the app entry point
The system SHALL display a landing page as the default route (`/`) when the app starts. The landing page MUST present a "Start new export" button as the primary action. The landing page SHALL render immediately without requiring AppContext to be populated — it MUST NOT be gated behind a loading state.

#### Scenario: App opens to landing page
- **WHEN** the user opens the app without a specific route
- **THEN** the system displays the landing page with a "Start new export" button

#### Scenario: User starts a new export
- **WHEN** the user clicks the "Start new export" button on the landing page
- **THEN** the system navigates to the wizard at `/wizard`

#### Scenario: Landing page renders before initialization completes
- **WHEN** the app is loaded and API initialization is still in progress
- **THEN** the landing page is fully visible with its title, subtitle, and "Start new export" button

### Requirement: Landing page is the return destination after export completion
The system SHALL navigate the user back to the landing page when the wizard's "Finish" action is activated. The wizard state MUST be fully reset so that returning to the wizard starts a fresh export session.

#### Scenario: Finish redirects to landing page
- **WHEN** the user clicks "Finish" on the last step of the wizard
- **THEN** the system navigates to the landing page at `/`

#### Scenario: Wizard state is reset after finish
- **WHEN** the user clicks "Finish" and then clicks "Start new export" again
- **THEN** the wizard starts at step 1 with all fields in their initial default state

