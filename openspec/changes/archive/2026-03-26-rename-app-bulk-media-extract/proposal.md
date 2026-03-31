## Why

The product name "Tracker File Bridge" no longer reflects the app's purpose after scope evolution. The app needs to be renamed to **Bulk Media Extract** across all surfaces — manifests, package metadata, runtime shell, landing page, and documentation. The landing page currently displays "File Export" which is also outdated and must be updated.

## What Changes

- Replace product name `Tracker File Bridge` → `Bulk Media Extract` in all metadata files (package.json, manifest.webapp, public/manifest.json, index.html)
- Replace npm package name `tracker-file-bridge` → `bulk-media-extract` in package.json and i18n localize script
- Update the DHIS2 HeaderBar `appName` prop to `Bulk Media Extract`
- Update the landing page title from `File Export` → `Bulk Media Extract`
- Update the app description to match the new identity
- Update the `application-identity` spec to reflect the new name
- Update i18n references (`"File Export Program Picker"` and related strings)

## Capabilities

### New Capabilities

_(none — this is a rename, not a new capability)_

### Modified Capabilities

- `application-identity`: Product name changes from `Tracker File Bridge` to `Bulk Media Extract`; landing page title changes from `File Export` to `Bulk Media Extract`

## Impact

- **Metadata files**: package.json, manifest.webapp, public/manifest.json, index.html
- **Runtime UI**: HeaderBar app name, landing page title
- **i18n**: Translation keys referencing old names in en.pot, es.po, en/translations.json, es/translations.json
- **Build artifacts**: build/ directory files will be regenerated on next build
- **Specs**: openspec/specs/application-identity/spec.md must be updated to reflect new name
