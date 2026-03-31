## Why

When deploying the app via zip file to a DHIS2 server, the `<meta name="dhis2-base-url">` tag is not injected (it's only present when served by the DHIS2 app platform). This causes `getBaseUrlSync()` to return `null`, triggering the `BaseUrlFallback` path. However, `BaseUrlFallback` never stores the resolved URL in component state — after `initializeApp` completes, `baseUrl` remains `null`, so the component keeps rendering `BaseUrlFallback` and re-fetching the manifest in an infinite loop. Additionally, the error UI has invalid nested `<h3>` tags.

## What Changes

- Store the resolved base URL from `BaseUrlFallback` in component state so the app can proceed to render the `<Provider>` once the manifest URL is resolved.
- Memoize `BaseUrlFallback` callbacks to prevent the effect from re-running on every render.
- Fix the nested `<h3>` in the error UI — replace the outer `<h3>` with a `<div>`.

## Capabilities

### New Capabilities

_(none)_

### Modified Capabilities

- `deferred-initialization`: The requirement for base URL resolution and error display needs updating — the fallback path must persist the resolved URL in state and use it for both initialization and Provider config. Error markup must use valid HTML.

## Impact

- **Code**: `src/webapp/pages/app/Dhis2App.tsx` — the `Dhis2App` component and `BaseUrlFallback` component.
- **Deployment**: Fixes zip-file deployments where the meta tag is absent. No impact on dev mode or platform-served deployments.
- **Dependencies**: None.
