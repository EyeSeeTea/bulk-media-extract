## Context

The wizard already includes a storage step after preview, and the current implementation stores URL, username, password, and a connection validation state inside the shared wizard context. The recently added UI guidance improves the presentation, but the validation action is still effectively mocked: it does not issue a real request to the configured WebDAV endpoint and can mark invalid configurations as valid based only on client-side checks. That breaks the trust model of this step and leaves the spec incomplete unless the test uses the real validation path.

This change should stay inside the existing clean-architecture boundaries. The domain and data layers already expose storage connection validation, so the work must connect the webapp to that real validation path rather than simulating success inside React state alone.

## Goals / Non-Goals

**Goals:**
- Make the storage step explicitly WebDAV-focused, including user-facing copy that states this is the only available target for now.
- Improve the storage form UX so required inputs, validation state, and the test-connection action are easier to understand and harder to misuse.
- Keep successful connection validation as a mandatory gate before advancing to execution.
- Ensure the test-connection action performs a real WebDAV validation request using the currently entered URL and credentials.
- Add concise implementation guidance about compatible software and deployment prerequisites such as CORS/browser access.
- Reuse existing validation use cases and wizard state instead of inventing a second storage flow or a fake validation path.

**Non-Goals:**
- Adding non-WebDAV storage providers such as S3, Google Drive, or SMB.
- Changing repository contracts or the domain-level storage validation API.
- Implementing long-term credential persistence outside the current in-session wizard state.
- Solving infrastructure setup automatically; the UI only explains prerequisites and validation outcomes.
- Accepting client-side URL-shape checks as proof that a WebDAV connection is valid.

## Decisions

### Treat the storage step as a guided confirmation screen, not only a form
The step will be organized around a primary objective: configure a WebDAV endpoint and prove the browser can reach it. Supporting copy will explain provider scope, examples, and required environment conditions near the form instead of hiding them in secondary documentation.

Alternative considered: leave the existing form structure intact and add one short notice above it. Rejected because the current step already has the required fields, so the missing value is guidance hierarchy and clearer task framing, not one more banner.

### Route the test action through the real storage validation use case
The validate-connection action must call the actual storage validation logic through the composition root and update `connectionStatus` from the async result. URL format and empty-field checks can still gate whether the action is enabled, but they must not decide success on their own.

Alternative considered: keep the timer-based mock and only improve the copy. Rejected because it creates a false-positive gate and defeats the purpose of testing a browser-to-server integration.

### Preserve the current connection status model, but tie it to request lifecycle
The existing `connectionStatus` and `connectionError` fields remain sufficient, but they must represent the lifecycle of a real request: idle before any test, validating while the request is in flight, valid only after a successful response, and invalid when the request fails or returns an authentication/connectivity error.

Alternative considered: add a separate "verified configuration" snapshot object after a successful test. Rejected because it duplicates state already represented by the current credentials plus validation status and would increase synchronization risk.

### Add setup guidance inline, with emphasis on WebDAV compatibility and CORS
The storage step will include short, actionable notes: WebDAV-only availability, examples like ownCloud and Nextcloud, and remarks that the remote server must allow browser-origin requests from the app origin for validation and file transfer to work.

Alternative considered: move all setup remarks to external documentation. Rejected because this guidance is needed at the exact moment users attempt configuration and should influence whether they even expect the connection test to succeed.

### Keep the change scoped to wizard presentation and validation behavior, but include real integration wiring
This proposal still modifies step-level requirements rather than the export execution contract, but it now explicitly includes wiring the wizard to the real storage validation path. Tests should cover both user-visible gating/copy and the fact that the validation action delegates to the real validation use case instead of a mock.

Alternative considered: introduce a dedicated storage capability spec and a broader settings model. Rejected because the requested behavior is confined to this wizard step and does not justify a new capability boundary yet.

## Risks / Trade-offs

- [Risk] Inline guidance becomes verbose and makes the step feel heavier. -> Mitigation: keep copy concise, grouped, and visually secondary to the credential/test action flow.
- [Risk] Real validation requests can fail for environmental reasons unrelated to credentials, such as CORS or proxies. -> Mitigation: surface the real failure path clearly and keep the step guidance focused on common infrastructure causes.
- [Risk] Users may interpret example products as an endorsement of a specific vendor. -> Mitigation: phrase them as examples of WebDAV-compatible software, not required targets.
- [Risk] Credential edits after a successful test could leave users thinking validation still applies. -> Mitigation: automatically clear the valid state whenever URL, username, or password changes.
- [Trade-off] The UI can explain CORS prerequisites, but it cannot diagnose every server-side misconfiguration precisely from the browser. -> Mitigation: provide general troubleshooting language and preserve detailed validation errors where available.

## Migration Plan

1. Keep the storage-step UI guidance updates in place.
2. Replace the mocked validation action with a real WebDAV validation call through the existing application composition and async handling.
3. Ensure storage field edits reset stale validation success and keep the next-step gate tied to a fresh successful test result.
4. Add or update tests for WebDAV-only messaging, real validation invocation, validation-state transitions, and blocked progression without a successful test.
5. Run typecheck, lint, and relevant wizard tests before merging.

Rollback strategy: revert the storage-step presentation changes and tests; no data or API migration is required because the change reuses the existing validation flow.

## Open Questions

- Do we want a link to provider-specific setup documentation later, or should the wizard remain fully self-contained?
