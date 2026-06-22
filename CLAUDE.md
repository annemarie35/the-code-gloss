# CLAUDE.md — code-gloss

Personal code glossary app built with Next.js, React, TypeScript, and PostgreSQL.

## Tech Stack

- **Framework**: Next.js 16 (Pages Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL via Docker (bitnami image), `pg` driver
- **Testing**: Vitest (unit/component), Playwright (integration/e2e)
- **Linting/Formatting**: ESLint + Prettier
- **Pre-commit hooks**: Husky + lint-staged (auto-formats and lints staged `.ts`/`.tsx` files)
- **Package manager**: npm

## Project Structure

```
src/
  pages/          # Next.js Pages Router (index, about, api/*)
  components/     # React components (card-grid, footer, header, navbar, theme-filter, gloss-terms-*)
  core/domain/    # Domain models
  actions/        # Server-side actions (gloses-actions.ts)
  lib/            # Library utilities
  helpers/        # Helper functions
  styles/         # Global styles

infra/
  database/       # SQL scripts and seeds

__tests__/        # Tests mirroring src structure
  src/            # Unit/component tests
  infra/          # Infra tests

integration-tests/ # Playwright e2e tests
```

## Development Setup

### Prerequisites

- Docker (for PostgreSQL)
- Node.js (version in `.nvmrc`)
- [Direnv](https://direnv.net/)

### Environment variables

```bash
cp .envrc.sample .envrc
direnv allow
```

### Start database and run migrations

```bash
npm run start:database        # starts Docker PostgreSQL container
npm run create:database       # creates the gloses table
npm run seed:database:pg      # seeds with SQL
# or
npm run seed:database:ts      # seeds with TypeScript script
```

### Run the app

```bash
npm run dev      # development server with Turbopack at http://localhost:3000
npm run build    # production build
npm run start    # production server
```

## Testing

```bash
npm run test              # unit + component tests (Vitest, excludes integration)
npm run test:integration  # e2e tests (Playwright)
npm run test:coverage     # Vitest with coverage report
```

Tests use `jsdom` environment. Setup file: `setup-tests.ts`.

## Linting & Formatting

```bash
npm run lint        # ESLint
npm run lint:fix    # ESLint with auto-fix (cached)
npm run format      # Prettier write
npm run type-check  # TypeScript type check
```

Pre-commit hooks run `format` and `lint:fix` automatically on staged files.

## Database Migrations (knex)

```bash
npx knex migrate:make migration_name   # create migration
npx knex migrate:latest                # run migrations
npx knex migrate:rollback              # rollback last migration
npx knex seed:make add_gloses          # create seed file
npx knex seed:run                      # run seeds
```

## Key Conventions

- **Domain logic** lives in `src/core/domain/`
- **Tests** mirror source paths under `__tests__/`
- **API routes** are in `src/pages/api/` with CSRF protection
- **CSP headers** are configured in `next.config.ts` — do not remove them
- No `.env` files should be committed; use `.envrc` with direnv

## Architecture Conventions

Before creating any new file, read an existing similar file to understand the pattern.

### Layered architecture — always follow this flow:

```
Page (src/pages/)
  → Action (src/actions/*-actions.ts)        # wraps API calls using httpClient
    → API route (src/pages/api/<resource>.ts) # thin, delegates to service
      → Service (src/lib/service/get-*.ts)   # business logic
        → Repository (infra/repositories/)   # database access
```

### Naming rules

- **API routes**: named after the resource (`gloses.ts`, `people.ts`, `feeds.ts`) — never `fetch-something.ts` or `get-something.ts`
- **Services**: `src/lib/service/get-<resource>.ts` or `add-<resource>.ts`
- **Actions**: `src/actions/<resource>-actions.ts`
- **Domain types**: `src/core/domain/models/<Resource>.ts` or `Types/<Resource>.ts`

### Each layer's responsibility

- **API routes**: validate input, apply rate limiting, call service, return HTTP response — no business logic
- **Services**: fetch/transform data, marked `'use server'`
- **Actions**: call `httpClient` from `src/lib/http.ts`, handle errors, return typed result
- **Pages**: call actions in `useEffect`, manage local state with `useState`

### Tests — mandatory

Every new file must have a corresponding test file created at the same time. No exceptions.

Test files mirror the source path under `__tests__/`:

| Source file                       | Test file                                        |
| --------------------------------- | ------------------------------------------------ |
| `src/pages/about.tsx`             | `__tests__/src/pages/about.test.tsx`             |
| `src/pages/api/gloses.ts`         | `__tests__/src/api/gloses.test.ts`               |
| `src/lib/service/get-gloses.ts`   | `__tests__/src/lib/service/get-gloses.test.ts`   |
| `src/actions/gloses-actions.ts`   | `__tests__/src/actions/gloses-actions.test.ts`   |
| `src/components/navbar.tsx`       | `__tests__/src/components/navbar.test.tsx`       |
| `src/core/domain/models/Glose.ts` | `__tests__/src/core/domain/models/Glose.test.ts` |

Note: API routes map to `__tests__/src/api/` (not `__tests__/src/pages/api/`).

### Never

- Export types from API route files — put them in `src/core/domain/`
- Put parsing or business logic inside an API route
- Call `fetch()` directly from a page — use an action
- Import from `src/pages/api/` in pages or components
- Create a source file without its test file

## Branch Strategy

- Main branch: `main`
- Feature branches are merged via PR
