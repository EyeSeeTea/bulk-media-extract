## Why

The app currently hardcodes the DHIS2 Tracker file download URL to `api/41`, which breaks file downloads against DHIS2 2.40 instances and causes export execution to fail with `404` responses. The preview step also lacks a direct link to the upstream source file, making it slower to verify whether a row points to the expected attachment before running an export.

## What Changes

- Detect the connected DHIS2 upstream version and build file download URLs with the correct endpoint shape for that version instead of always using the 2.41 Tracker file route.
- Ensure the preview step, exported execution configuration, and execution runner all use the same version-aware source file URL.
- Add a direct link to the original upstream file in the preview step so users can open and verify a source file from each preview row.
- Add coverage for both DHIS2 2.40 and 2.41+ URL generation paths and for the preview link rendering.

## Capabilities

### New Capabilities

### Modified Capabilities
- `file-export-wizard`: The preview-derived execution configuration must preserve source file URLs that match the detected DHIS2 version, and the preview step must expose a quick action to open the original upstream file for a row.
- `org-unit-event-preview`: Preview rows must generate original-file links using the correct DHIS2 file endpoint for the connected upstream version while keeping the existing preview table structure.

## Impact

- Affected code: app bootstrap/version context, preview row builders, preview UI, execution configuration generation, execution downloads, and related tests under `src/webapp/`.
- Affected integration: DHIS2 server-version discovery and file download URL selection in browser-side requests.
- User impact: exports become compatible with DHIS2 2.40 file endpoints and preview review becomes faster because source files can be opened directly.
