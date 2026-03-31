## 1. Package and Manifest Metadata

- [x] 1.1 Update `package.json`: change `"name"` from `"tracker-file-bridge"` to `"bulk-media-extract"`
- [x] 1.2 Update `package.json`: change manifest.webapp `"name"` from `"Tracker File Bridge"` to `"Bulk Media Extract"`
- [x] 1.3 Update `package.json`: change `"description"` and manifest.webapp `"description"` to `"Bulk extract and export DHIS2 media files to external storage with metadata-driven paths."`
- [x] 1.4 Update `package.json`: change i18n localize script `-n tracker-file-bridge` to `-n bulk-media-extract`
- [x] 1.5 Update `manifest.webapp`: change `"name"` to `"Bulk Media Extract"` and `"description"` to new description
- [x] 1.6 Update `public/manifest.json`: change `"short_name"` and `"name"` to `"Bulk Media Extract"`
- [x] 1.7 Update `index.html`: change `<title>` to `"Bulk Media Extract"`

## 2. Runtime UI Components

- [x] 2.1 Update `src/webapp/pages/app/App.tsx`: change HeaderBar `appName` prop to `"Bulk Media Extract"`
- [x] 2.2 Update `src/webapp/pages/landing/LandingPage.tsx`: change i18n key from `"File Export"` to `"Bulk Media Extract"`

## 3. Internationalization

- [x] 3.1 Update `i18n/en.pot`: replace `"File Export"` references with `"Bulk Media Extract"`
- [x] 3.2 Update `i18n/es.po`: replace `"File Export"` references with `"Bulk Media Extract"`
- [x] 3.3 Update `src/locales/en/translations.json`: replace `"File Export"` key references
- [x] 3.4 Update `src/locales/es/translations.json`: replace `"File Export"` key references

## 4. Specification

- [x] 4.1 Update `openspec/specs/application-identity/spec.md`: replace `"Tracker File Bridge"` with `"Bulk Media Extract"` and update description

## 5. Verification

- [x] 5.1 Grep for any remaining references to `"Tracker File Bridge"` in source files and fix
- [x] 5.2 Grep for any remaining references to `"tracker-file-bridge"` in source files and fix
- [x] 5.3 Grep for remaining `"File Export"` references that should be updated and fix

## 6. Lint and Code Quality Fixes

- [x] 6.1 Fix `OrgUnitTreePicker.tsx` non-null assertion warning (replace `segments[i]!` with `segments[i] as string`)
- [x] 6.2 Fix `WizardShell.spec.tsx` testing-library errors (replace `.closest("button")` with `getByRole("button")`)
- [x] 6.3 Fix `StorageStep.tsx` i18next namespace separator issue (add `nsSeparator: false` to `i18n.t("Selected folder: {{name}}")`)
- [x] 6.4 Add i18n `nsSeparator` caveat remark to `AGENTS.md`
