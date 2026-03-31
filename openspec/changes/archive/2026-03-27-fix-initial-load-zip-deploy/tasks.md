## 1. Fix base URL state management

- [x] 1.1 Add `baseUrl` as React state in `Dhis2App`, initialized from `getBaseUrlSync()`
- [x] 1.2 Memoize `onResolved` callback with `useCallback` — it should call `setBaseUrl(url)` and then `initializeApp(url).then(setInitState)`
- [x] 1.3 Memoize `onError` callback with `useCallback` — it should call `setInitState` with the error state
- [x] 1.4 Guard the `useEffect` for `initializeApp` with a cleanup flag to prevent double-initialization race

## 2. Fix error UI markup

- [x] 2.1 Replace outer `<h3>` with `<div>` in the error branch of `Dhis2App`

## 3. Verify

- [ ] 3.1 Test locally in dev mode — confirm app still loads normally
- [ ] 3.2 Build and deploy as zip file to a DHIS2 server — confirm no infinite loop and app initializes correctly
