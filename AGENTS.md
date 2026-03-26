# DHIS2 File Bridge - Agent Guidelines

## Project Overview

DHIS2 File Bridge is a custom DHIS2 Web App that automates the export of file-type dataValues from DHIS2 Tracker Programs to external storage solutions (ownCloud, Nextcloud, S3, etc.). The app enables dynamic folder structures and filenames using DHIS2 metadata as template variables (e.g., `/{orgUnitName}/{enrollmentDate}/{attribute:NationalID}_{dataElement:FileName}.pdf`).

**Key Features:**
- Program/Stage picker with date range and org unit filtering
- Pluggable storage providers (WebDAV primary, designed for S3/GDrive expansion)
- Template engine for dynamic path mapping with metadata variables
- Batch processing with progress tracking and error logging
- Browser-based file transfer with CORS validation

## Architecture

This project follows **Clean Architecture** principles with strict layer separation:

### Layer Structure

```
src/
├── domain/           # Business logic (framework-agnostic)
│   ├── entities/     # Business models (extend Struct, no external imports)
│   ├── repositories/ # Interface definitions (CRUD operations only)
│   └── usecases/     # Single-action commands (verb-based naming)
├── data/             # Repository implementations (D2Api, WebDAV, Test)
├── scripts/          # CLI tools related to the app
└── webapp/           # React UI (pages, components, contexts)
```

### Key Patterns

**Entities** ([User.ts](src/domain/entities/User.ts)):
- Extend `Struct<Attrs>()` for immutability and `.create()/.update()` methods
- Contain business logic methods (e.g., `isAdmin()`, `belongToUserGroup()`)
- No external library imports allowed

**Use Cases** ([GetCurrentUserUseCase.ts](src/domain/usecases/GetCurrentUserUseCase.ts)):
- Follow Command pattern: `constructor(...repositories).execute(...parameters)`
- Single-action focus (e.g., `ExportFilesToStorageUseCase`, `ValidateStorageConnectionUseCase`)
- Return `FutureData<T>` for async operations

**Repositories** ([UserD2Repository.ts](src/data/repositories/UserD2Repository.ts)):
- Implement domain interfaces with concrete data sources
- Use `apiToFuture()` wrapper for D2Api calls
- Naming: `{Interface}{Implementation}Repository` (e.g., `StorageWebDAVRepository`)

**Composition Root** ([CompositionRoot.ts](src/CompositionRoot.ts)):
- Wires repositories to use cases
- Provides `getWebappCompositionRoot(api)` and `getTestCompositionRoot()`
- Called only from presentation layer

### Async Handling

Use **Futures** instead of Promises:
```typescript
import { FutureData } from "$/data/api-futures";

// Example: Chain transformations
return this.api.events.get(params)
    .pipe(Future.sequential)  // Process in sequence
    .flatMap(event => this.storage.upload(event.file))
    .mapError(error => new CustomError(error));
```

## Code Style

- **Imports**: Use `$/` alias for `src/` (configured in [tsconfig.json](tsconfig.json))
- **Naming**:
  - Files: `PascalCase` (e.g., `ExportFilesUseCase.ts`)
  - Folders: `kebab-case` (e.g., `file-export-wizard/`)
  - Use cases: Verb-based (e.g., `DownloadTemplateUseCase`)
- **Types**: Strict. Explicit return types on public methods
- **Testing**: Colocate tests in `__tests__/` subdirectories, use `.spec.ts` suffix

## Build and Test

```bash
# Initial setup
nvm use          # Uses .nvmrc node version
yarn install

# Development
yarn start          # Dev server at http://localhost:8081

# Build distributable
yarn build          # Outputs DHIS2 zip to build/

# Tests
yarn typecheck      # TypeScript type checking (no emit)
yarn lint           # Run lint
yarn test           # Vitest test suite
yarn prettify       # Code format using prettier
yarn localize       # Update i18n .po files from i18n.t() calls
```

## Git Workflow

- Default branch for new work: `development`
- Branch from another feature branch only when there is a dependency on unmerged work.
  Merge back to the same branch you started from.
- Branch naming:
  - `feature/<human-readable-name>` for new features
  - `fix/<human-readable-name>` for bug fixes
- All commits use Conventional Commits:
  - `feat(scope): description` for new features
  - `fix(scope): description` for bug fixes
  - `refactor(scope): description` for restructuring
  - `test(scope): description` for test changes
  - `docs(scope): description` for documentation
  - `chore(scope): description` for maintenance

## Internationalization (i18n)

- This project uses `@dhis2/d2-i18n` which is built on i18next.
- **Colon caveat**: i18next treats `:` as a namespace separator by default. Any `i18n.t()` call whose key contains a colon (e.g., `"Selected folder: {{name}}"`) must pass `{ nsSeparator: false }` in its options, otherwise i18next will silently split the key at the colon and fail to find the translation.

## DHIS2 Integration

**API Access**:
- Use `@eyeseetea/d2-api` for type-safe DHIS2 API calls
- All requests to `/dhis2/*` are proxied to avoid CORS (see [vite.config.ts](vite.config.ts#L38))

**Error Handling**: Use `Either<Error, T>` for operations with expected failures (e.g., file not found)

Use `@dhis2/ui` components for native DHIS2 styling (avoid custom Material-UI where possible).
