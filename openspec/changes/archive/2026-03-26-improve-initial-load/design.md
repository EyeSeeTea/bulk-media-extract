## Context

The app currently has a two-stage synchronous loading gate:

1. **Dhis2App** fetches base URL, user settings, DHIS2 version, and creates the CompositionRoot. During this, it renders `<h3>Loading...</h3>`.
2. **App** fetches the current user via `/me`. During this, it renders `null`.

Only after both stages complete does the HeaderBar and landing page appear. The landing page itself is entirely static — it shows a title, subtitle, and a "Start new export" button. None of this content requires API data.

## Goals / Non-Goals

**Goals:**
- Show the DHIS2 HeaderBar and landing page content instantly on app start.
- Defer API requests to run in the background without blocking the initial render.
- Use a DHIS2 `CircularLoader` for any remaining loading states (e.g., navigating to the wizard before initialization completes).

**Non-Goals:**
- Changing the data that is fetched or the initialization sequence itself.
- Modifying the wizard or any other page beyond guarding them with a loading state.
- Server-side rendering or code splitting.

## Decisions

### 1. Render the app shell immediately, defer `getData()` to a background effect

**Decision**: Instead of blocking render on `getData()`, call it inside a `useEffect` and render the Provider + App shell with a "not yet initialized" state.

**Rationale**: The DHIS2 `<Provider>` needs a `baseUrl` to mount, but we can resolve that synchronously in most cases (meta tag in production, hardcoded in dev). The heavier requests (user settings, system info, current user) can happen after first paint.

**Alternative considered**: Lazy-loading data per route. Rejected because the initialization is shared state needed by multiple routes, and the current CompositionRoot pattern requires it upfront.

### 2. Split base URL resolution from API data fetching

**Decision**: Resolve the base URL synchronously (or with a minimal async fallback) so the Provider can mount immediately. User settings, DHIS2 version, and current user load asynchronously after mount.

**Rationale**: Base URL resolution from the meta tag is synchronous. Only the `manifest.webapp` fallback is async, and that path is rare (production apps use the meta tag injection).

### 3. Guard data-dependent routes with a centered CircularLoader

**Decision**: The landing page renders without AppContext. The wizard and other routes check if AppContext is available and show a `CircularLoader` centered on screen if not.

**Rationale**: This gives immediate feedback on the landing page while ensuring data-dependent flows don't break. The DHIS2 `CircularLoader` matches the design system.

### 4. Keep HeaderBar visible from first render

**Decision**: Move `HeaderBar` rendering outside the AppContext loading gate so it appears immediately with the app name.

**Rationale**: The HeaderBar with `appName="Bulk Media Extract"` doesn't need user data to render its basic form. DHIS2 HeaderBar fetches its own user menu data internally via the Provider.

## Risks / Trade-offs

- **[Risk] User navigates to wizard before init completes** → Mitigation: Show CircularLoader on data-dependent routes until AppContext is populated. The "Start new export" button remains functional; the wizard simply shows a loader briefly.
- **[Risk] Base URL resolution fails silently** → Mitigation: Keep the error state handling from current Dhis2App. If base URL can't be resolved, show an error screen as before.
- **[Trade-off] i18n not ready on first render** → The landing page text will briefly render in the default locale (English) before `configI18n` runs. This is acceptable because: (a) most users use English, (b) the flash is brief, (c) React will re-render with the correct locale once settings load.
