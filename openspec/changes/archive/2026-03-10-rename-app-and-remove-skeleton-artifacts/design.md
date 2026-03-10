## Context

The repository has already evolved into a DHIS2 Tracker file-export tool, but several presentation and packaging surfaces still identify it as `DHIS2 Skeleton App` or `Skeleton App`. That stale identity appears in `package.json`, `public/manifest.json`, the generated `manifest.webapp` fields, the i18n generation name, and the runtime `HeaderBar` title. In parallel, the router still exposes `"/for/:name?"`, which renders `ExamplePage` from the original bootstrap and is unrelated to the file-export workflow.

This change is small in scope but cross-cutting because the app name is duplicated across build-time metadata, runtime UI, and documentation. The cleanup also removes reachable code paths, so the design needs to make the supported application shell explicit rather than treating the work as a cosmetic rename.

## Goals / Non-Goals

**Goals:**
- Establish one consistent product identity for the distributable app and the runtime shell.
- Choose a name and description that fit the current feature set without coupling the app to WebDAV as the only storage provider.
- Remove the unused skeleton example route and its backing assets so the router exposes only supported navigation paths.
- Leave the current wizard and landing functionality intact while cleaning up stale bootstrap references.

**Non-Goals:**
- Renaming TypeScript symbols, folder names, or repository classes that already reflect the domain well enough.
- Redesigning the file-export flow, changing existing capabilities, or introducing new storage providers.
- Broad dead-code elimination beyond the clearly obsolete skeleton example entrypoint and directly related references.

## Decisions

### Use a product-facing name that is DHIS2-specific but storage-agnostic

The proposed app name is `Tracker File Bridge`. It is DHIS2-oriented because it references Tracker explicitly, and it describes the app’s core role as moving DHIS2-managed files into external destinations. The accompanying description should be `Export DHIS2 Tracker files to external storage with metadata-driven paths.` because it captures the current template-driven mapping behavior without implying WebDAV is the only backend.

Alternative considered: keep `DHIS2` in the visible product name, such as `DHIS2 Tracker File Bridge`.
Why not: the package and manifest context already place the app inside DHIS2, so a shorter visible name is cleaner while the description still carries the platform context.

### Treat identity as a single source-of-truth sweep across metadata surfaces

Implementation should update every shipping identity surface together: `package.json` name/description and `manifest.webapp` fields, `public/manifest.json`, the runtime `HeaderBar`, and the localization app identifier used by `d2-i18n-generate`. This avoids the common failure mode where the built zip, translated catalog, and runtime header disagree about what the app is called.

Alternative considered: only update the visible UI title and manifest display name.
Why not: that leaves the npm package name, translation catalog namespace, and generated artifacts still branded as skeleton, which is exactly the inconsistency this change is meant to remove.

### Remove the example route entirely instead of hiding it

The router should no longer define `"/for/:name?"`, and the `ExamplePage` implementation, tests, and snapshots should be deleted if nothing else imports them. This keeps the app shell aligned with real supported flows and avoids carrying a reachable bootstrap screen that could confuse users or reviewers.

Alternative considered: leave the route in place but stop linking to it.
Why not: the route is already unsupported and unused, so keeping it reachable preserves unnecessary maintenance surface and test noise.

### Keep cleanup scoped to clearly related skeleton artifacts

The implementation should remove the route-level example page assets and update documentation references that still describe the app as a skeleton. It should not opportunistically delete unrelated bootstrap remnants unless they are proven unused by the rename and route cleanup work.

Alternative considered: use this change as a general dead-code purge of all bootstrap leftovers.
Why not: that would expand scope, increase review surface, and make it harder to distinguish product-branding work from speculative cleanup.

## Risks / Trade-offs

- `[Metadata rename may miss a surface and leave mixed branding]` → Use a repository-wide search for `Skeleton App`, `skeleton`, and the old i18n namespace before finishing implementation.
- `[Changing the package name may affect downstream build or deployment expectations]` → Keep the package rename limited to the app artifact identity and verify the existing build pipeline still produces the expected zip output.
- `[Removing the example route may break an untracked local bookmark or test helper]` → Confirm the route is unused in code and update or remove any route-specific tests as part of the same change.
- `[Documentation cleanup can drift from implemented behavior]` → Limit doc updates to identity and supported entrypoints that can be verified directly in the codebase.

## Migration Plan

No data migration is required.

Implementation rollout:
1. Replace skeleton branding across package metadata, manifest fields, runtime header text, and localization identifiers.
2. Remove the `"/for/:name?"` route and delete the `ExamplePage` assets that become unreachable.
3. Update any repository documentation that still refers to the project as a skeleton or points developers at the removed example route.
4. Run targeted verification for routing, typecheck, and tests affected by deleted example artifacts.

Rollback strategy:
- Revert the identity updates and restore the deleted example route assets if the rename causes unexpected build or packaging issues.

## Open Questions

- Whether the package slug should stay close to the visible product name, for example `tracker-file-bridge`, or retain a more organization-specific naming convention for artifact publication.
