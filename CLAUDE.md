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

## Branch Strategy

- Main branch: `main`
- Feature branches are merged via PR
