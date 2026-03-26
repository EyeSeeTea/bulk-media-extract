## MODIFIED Requirements

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
