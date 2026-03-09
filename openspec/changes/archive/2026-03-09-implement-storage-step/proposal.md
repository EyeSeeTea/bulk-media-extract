## Why

The wizard's storage step currently behaves like a basic credential form, which leaves too much ambiguity at the point where users must connect to an external system. This change is needed now to turn storage setup into a clear, trustworthy gate: users should understand that only WebDAV is supported today, know what infrastructure prerequisites apply, and successfully validate the connection before they can continue.

## What Changes

- Refine the wizard storage step UX so WebDAV credentials are presented as a guided configuration form instead of a minimal input block.
- Require a successful WebDAV connection test in the storage step before users can advance to execution.
- Ensure the connection test performs a real validation request against the configured WebDAV endpoint instead of using simulated client-side success criteria.
- Add explicit product guidance that WebDAV is the only supported target for now, with examples such as ownCloud and Nextcloud.
- Add explanatory remarks about environment and server prerequisites for browser-based validation, including CORS-related requirements.
- Improve validation, loading, success, and failure feedback in the storage step so users can understand what to fix before retrying.

## Capabilities

### New Capabilities

### Modified Capabilities

- `file-export-wizard`: Strengthen the storage step requirements around WebDAV-only messaging, connection-test gating, and setup guidance for browser-compatible storage configuration.

## Impact

- Affected code: `src/webapp/pages/wizard/` storage-step presentation, wizard validation/state handling, storage validation integration, and related tests.
- Affected domain/data flow: the wizard must call the real storage validation path and treat only a real successful WebDAV response as a valid progression gate.
- APIs/systems: no new provider is introduced; the change remains limited to WebDAV-compatible targets and browser-side configuration constraints such as CORS, but it must now issue an actual network validation request to the configured endpoint.
