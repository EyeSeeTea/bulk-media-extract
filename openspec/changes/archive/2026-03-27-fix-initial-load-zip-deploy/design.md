## Context

The `Dhis2App` component resolves the DHIS2 base URL via two strategies:

1. **Synchronous**: `getBaseUrlSync()` reads a `<meta name="dhis2-base-url">` tag (injected by the DHIS2 app platform at serve time) or returns `/dhis2` in dev mode.
2. **Async fallback**: `BaseUrlFallback` fetches `manifest.webapp` to extract the base URL.

When deployed as a zip file, strategy 1 returns `null` (no meta tag), so strategy 2 kicks in. However, the resolved URL from `BaseUrlFallback` is only used to call `initializeApp()` — it is never stored in component state. Since `baseUrl` (a local variable from `getBaseUrlSync()`) remains `null`, the component re-renders `BaseUrlFallback` on every cycle, creating an infinite loop of manifest fetches and `initializeApp` calls.

Additionally, the `onResolved` and `onError` callbacks are recreated on every render (inline arrow functions), causing the `useEffect` in `BaseUrlFallback` to re-fire each time.

## Goals / Non-Goals

**Goals:**
- Fix the infinite loop when base URL is resolved via manifest fallback
- Ensure the resolved URL is used for both `initializeApp` and the `<Provider>` config
- Fix invalid nested `<h3>` HTML in the error UI

**Non-Goals:**
- Changing the deferred initialization / app-shell architecture
- Supporting additional base URL resolution strategies
- Modifying dev-mode behavior

## Decisions

### Decision 1: Store resolved base URL in React state

Add a `baseUrl` state variable initialized from `getBaseUrlSync()`. When `BaseUrlFallback` resolves the URL, update this state. This causes a single re-render where `baseUrl` is now non-null, exiting the fallback branch and entering the normal `<Provider>` path.

**Alternative considered**: Storing the URL in a ref and forcing a re-render. Rejected because React state is the idiomatic mechanism and naturally triggers re-render.

### Decision 2: Memoize fallback callbacks with useCallback

Wrap `onResolved` and `onError` in `React.useCallback` so that `BaseUrlFallback`'s effect dependency array is stable and the manifest fetch runs exactly once.

**Alternative considered**: Removing the dependency array in BaseUrlFallback's useEffect (empty `[]`). Rejected because it would hide the actual dependency and ESLint would warn.

### Decision 3: Replace outer `<h3>` with `<div>` in error UI

Simple fix — the outer `<h3>` wrapping the error message becomes a `<div>`, keeping the inner `<h3>` for the error heading. This produces valid, accessible HTML.

## Risks / Trade-offs

- **[Low] State initialization timing**: `getBaseUrlSync()` is called during render to initialize state. This is safe because it's a synchronous DOM read with no side effects. → No mitigation needed.
- **[Low] Double initialization race**: If `BaseUrlFallback` resolves and `setBaseUrl` triggers a re-render while `initializeApp` is still running from the callback, the `useEffect` in the main branch could start a second initialization. → Mitigation: guard `initializeApp` in the effect with an `ignore` flag (cleanup pattern) or check `initState` before calling.
