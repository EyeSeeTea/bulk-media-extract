## Why

The app still presents itself as a generic skeleton in package metadata, DHIS2 manifest fields, and the runtime header, which makes the deliverable look unfinished and harder to understand for users and maintainers. The codebase also still ships a leftover example route and page from the bootstrap project even though the supported experience is the file-export flow.

## What Changes

- Rename the app everywhere user-facing and distributable metadata is defined, including `package.json`, generated DHIS2 manifest fields, the PWA manifest, localization app identifier, and the runtime header bar.
- Adopt the product name `Tracker File Bridge`.
- Adopt the description `Export DHIS2 Tracker files to external storage with metadata-driven paths.`
- Remove the unused skeleton example route `"/for/:name?"` and delete its backing page, tests, and snapshots so the shipped app exposes only supported entrypoints.
- Update documentation and related references that still describe the project as a skeleton or example app.

## Capabilities

### New Capabilities

- `application-identity`: Defines the published app name, concise product description, and the supported runtime entrypoints for the distributed application shell.

### Modified Capabilities

None.

## Impact

- Affected code: `package.json`, `public/manifest.json`, `src/webapp/pages/app/App.tsx`, `src/webapp/pages/Router.tsx`, the `src/webapp/pages/example/` tree, and any docs or localization configuration that still refer to the skeleton bootstrap.
- Behavioral impact: the app’s published identity changes from generic skeleton branding to product branding, and the unsupported example route is removed from the shipped router.
- No repository, use-case, or external-storage API changes are expected.
