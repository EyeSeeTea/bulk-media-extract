## Why

When the app starts, the entire screen is blank except for an unstyled `<h3>Loading...</h3>` message while API requests complete. This creates a poor first impression and makes the app feel slow, even though the landing page itself doesn't depend on most of the fetched data.

## What Changes

- Show the DHIS2 HeaderBar and landing page immediately on app start, before API requests complete.
- Move data fetching (user settings, DHIS2 version, current user) to happen in the background, after the shell is visible.
- Replace any remaining loading states with a centered DHIS2 `CircularLoader` instead of plain text.
- Ensure the wizard and other data-dependent routes wait for initialization to complete before rendering.

## Capabilities

### New Capabilities
- `deferred-initialization`: Defers API requests (user settings, system info, current user) so the app shell and landing page render immediately, loading data in the background.

### Modified Capabilities
- `landing-page`: The landing page must now render before the full app context is available, showing the header bar and static content immediately.

## Impact

- `src/webapp/pages/app/Dhis2App.tsx` - Remove synchronous loading gate; render Provider and App shell immediately.
- `src/webapp/pages/app/App.tsx` - Restructure to show HeaderBar and Router before AppContext is fully populated; guard data-dependent routes.
- `src/webapp/pages/landing/LandingPage.tsx` - May need minor adjustments to not depend on AppContext.
- Dependencies: Uses existing `@dhis2/ui` `CircularLoader` component (already available).
