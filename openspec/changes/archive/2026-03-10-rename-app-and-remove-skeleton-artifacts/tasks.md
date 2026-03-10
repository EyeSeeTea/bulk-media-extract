## 1. Product identity sweep

- [x] 1.1 Rename the app metadata in `package.json` and generated DHIS2 manifest fields to `Tracker File Bridge` with the approved description.
- [x] 1.2 Update `public/manifest.json`, the runtime header in `src/webapp/pages/app/App.tsx`, and the localization app identifier so shipped identity surfaces stay consistent.
- [x] 1.3 Refresh docs or repository references that still present the project as a skeleton or example app.

## 2. Skeleton route cleanup

- [x] 2.1 Remove the `"/for/:name?"` route from `src/webapp/pages/Router.tsx` and keep the file-export flow as the supported default entrypoint.
- [x] 2.2 Delete `src/webapp/pages/example/` assets that become unused, including related tests and snapshots.
- [x] 2.3 Verify no remaining imports or references point at the removed example page or route.

## 3. Verification

- [x] 3.1 Run targeted searches to confirm skeleton branding and the removed route are no longer present in supported app surfaces.
- [x] 3.2 Run the relevant verification commands, at minimum affected tests and `yarn typecheck`, and fix regressions introduced by the rename and cleanup.
