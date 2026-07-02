# ADR 001 — Use Dockerfile to initialize database schema on container startup

- **Date**: 2026-07-02
- **Status**: Accepted

## Context

The project uses a bitnami/postgresql container managed by Docker Compose. Previously, starting the database required two manual steps:

1. `docker compose up -d` — start the container
2. `npm run create:database` — run SQL scripts to create the `gloses` and `people` tables

This two-step process was error-prone: the app would fail if a developer forgot to run the second command, and there was no guarantee the container was ready before the scripts were executed.

## Decision

Introduce a `Dockerfile` that extends `bitnami/postgresql:latest` and copies `infra/database/seeds/` into `/docker-entrypoint-initdb.d/`.

```dockerfile
# syntax=docker/dockerfile:1
FROM bitnami/postgresql:latest
COPY infra/database/seeds/migrations.sql /docker-entrypoint-initdb.d/
```

The `migrations.sql` file contains the full schema (`CREATE TABLE IF NOT EXISTS` for `gloses` and `people`) plus any `ALTER TABLE` statements needed to keep it up to date.

Docker Compose is updated to use `build` instead of pulling the image directly:

```yaml
services:
    postgresql:
        build:
            context: .
            dockerfile: Dockerfile
```

The database is now initialized with a single command:

```bash
docker compose up -d --build
```

## Consequences

**Positive**

- One command sets up a fully ready database — no manual follow-up step.
- Schema is version-controlled alongside the application code.
- `/docker-entrypoint-initdb.d/` scripts only run when the data directory is empty, so re-running `docker compose up -d` on an existing volume is safe and idempotent.
- New contributors get a working database out of the box.

**Negative / constraints**

- `--build` must be passed whenever `migrations.sql` changes, otherwise the running container uses a stale image.
- To apply schema changes to an existing container, the volume must be destroyed first (`docker compose down -v`) so the init scripts re-run. This is acceptable for a local development database with no persistent data requirement.
- The `Dockerfile` is solely for local development; it should not be used to build a production image.
