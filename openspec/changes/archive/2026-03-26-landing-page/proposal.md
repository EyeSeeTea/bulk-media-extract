## Why

The app currently launches directly into the export wizard, with no entry point or home screen. This means users have no place to return to after completing an export and no clear starting point for new exports. A landing page provides a home base that separates "starting an export" from "configuring an export," making the app feel more intentional and setting the stage for future features (e.g., export history, saved configurations).

## What Changes

- Add a new landing page as the app's default route (`/`), replacing the wizard as the initial view.
- The landing page displays a single "Start new export" button.
- Clicking the button navigates to the wizard (`/wizard`).
- The wizard's "Finish" button redirects the user back to the landing page and fully resets the wizard state.
- The wizard is no longer the default route; it requires explicit navigation.
- The wizard's "Back" button is hidden on the first step (not just disabled).
- A back/exit action in the wizard page header allows the user to leave the wizard at any point. It triggers a confirmation modal warning that all progress will be lost, then navigates to the landing page.

## Capabilities

### New Capabilities
- `landing-page`: A new home page component with a "Start new export" action that serves as the app's entry point and return destination after export completion.

### Modified Capabilities
- `file-export-wizard`: The wizard's "Finish" action now navigates back to the landing page and resets all wizard state, instead of remaining on the last step.

## Impact

- **Router** (`src/webapp/pages/Router.tsx`): Default route changes from `WizardPage` to a new `LandingPage` component.
- **WizardShell** (`src/webapp/components/wizard/WizardShell.tsx`): The `onFinish` callback triggers navigation + state reset. Back button hidden on step 1.
- **WizardPage** (`src/webapp/pages/wizard/WizardPage.tsx`): Wraps wizard content with `PageHeader` providing the exit action and confirmation modal.
- **WizardContent** (`src/webapp/pages/wizard/WizardContent.tsx`): The `onFinish` handler integrates with React Router navigation.
