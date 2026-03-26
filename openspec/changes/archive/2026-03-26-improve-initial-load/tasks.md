## 1. Resolve base URL synchronously

- [x] 1.1 Extract `getBaseUrl()` to return synchronously from the meta tag, with an async fallback only for the manifest path. Ensure the Provider can mount without awaiting.

## 2. Restructure Dhis2App to render immediately

- [x] 2.1 Refactor `Dhis2App` to render the `<Provider>` and `<App>` shell on first render instead of showing `<h3>Loading...</h3>`.
- [x] 2.2 Move `getData()` (user settings, DHIS2 version, CompositionRoot, i18n config) into a background `useEffect` that populates state after mount.
- [x] 2.3 Keep error handling: if initialization fails, display an error screen.

## 3. Restructure App to show HeaderBar before AppContext is ready

- [x] 3.1 Move `HeaderBar` rendering outside the `loading` guard so it is visible from first render.
- [x] 3.2 Replace `return null` loading state with a centered `CircularLoader` from `@dhis2/ui` for data-dependent routes.
- [x] 3.3 Ensure `AppContext` is set once all API data resolves; routes that need it wait with the loader.

## 4. Update landing page to render without AppContext

- [x] 4.1 Verify the landing page does not read from `AppContext`. If it does, remove the dependency so it renders immediately.
- [x] 4.2 Ensure the "Start new export" button and navigation work before initialization completes.

## 5. Verify and clean up

- [x] 5.1 Test that the landing page and HeaderBar are visible immediately on app start.
- [x] 5.2 Test that navigating to `/wizard` before init completes shows a centered `CircularLoader`.
- [x] 5.3 Test that once init completes, the wizard renders normally.
- [x] 5.4 Remove the old `<h3>Loading...</h3>` markup from Dhis2App.
