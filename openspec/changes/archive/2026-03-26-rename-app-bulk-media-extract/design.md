## Context

The app is currently branded as "Tracker File Bridge" across all metadata and runtime surfaces, with the landing page separately displaying "File Export". The rename to "Bulk Media Extract" requires a coordinated find-and-replace across metadata files, runtime components, i18n catalogs, and the authoritative spec.

Affected files (source only, excluding build/):
- `package.json` — npm name + manifest.webapp embedded section
- `manifest.webapp` — DHIS2 app manifest
- `public/manifest.json` — PWA manifest
- `index.html` — HTML title
- `src/webapp/pages/app/App.tsx` — HeaderBar appName prop
- `src/webapp/pages/landing/LandingPage.tsx` — landing page title (i18n key)
- `i18n/en.pot`, `i18n/es.po` — gettext catalogs
- `src/locales/en/translations.json`, `src/locales/es/translations.json` — compiled translations
- `openspec/specs/application-identity/spec.md` — authoritative spec

## Goals / Non-Goals

**Goals:**
- Replace all source-controlled references to "Tracker File Bridge" with "Bulk Media Extract"
- Replace the landing page title "File Export" with "Bulk Media Extract"
- Update the npm package name from `tracker-file-bridge` to `bulk-media-extract`
- Update the app description to reflect the new identity
- Update the application-identity spec to be the source of truth for the new name

**Non-Goals:**
- Changing the git repository name or remote URL
- Updating any external systems (DHIS2 app hub, CI config) — those are out of scope
- Modifying build output files (they regenerate from source)
- Renaming the `openspec/` directory structure or changing the project's folder name

## Decisions

**1. Straightforward find-and-replace approach**
This is a pure renaming change with no architectural implications. Each file gets a direct string replacement. No abstraction or centralized config is needed since the name appears in different file formats (JSON, HTML, TSX, gettext).

**2. Update description alongside name**
The current description "Export DHIS2 Tracker files to external storage with metadata-driven paths." references "Tracker" which is no longer accurate. Update to: "Bulk extract and export DHIS2 media files to external storage with metadata-driven paths."

**3. i18n key for landing page**
The landing page uses `i18n.t("File Export")` as the translation key. Replace the key with `"Bulk Media Extract"`. The i18n catalogs and compiled translations must be updated to match.

## Risks / Trade-offs

- **[Risk] Stale build artifacts** → build/ files will be outdated until next build. No action needed; they are gitignored or regenerated.
- **[Risk] npm name change breaks install caches** → Minimal impact since this is a DHIS2 app, not a published npm package. Developers may need to clear node_modules.
- **[Risk] Missed references** → Mitigated by grep-based verification after implementation.
