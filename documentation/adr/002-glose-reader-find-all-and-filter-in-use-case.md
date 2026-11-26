# ADR 002 — GloseReader exposes findAll; searchGloses filters in the use case

- **Date**: 2026-11-26
- **Status**: Accepted

## Context

The local MCP server (`plans/mcp-server.md`) exposes a `search_gloses` tool that takes an optional text `query` and optional `themes`. It is the first gloses feature built with the target architecture (`documentation/architecture-cible.md`), so it needs a new port, `src/core/ports/glose-reader.ts`, and that port's shape has to be chosen before it is written.

The code review of the plan (point 5 of `plans/improve-gloses-mcp.md`) raised the question: should the port be `findAll()` with the filtering done in memory by the use case, or `search({ query, themes, limit })` with the filtering, the limit and the count done in SQL?

Facts that weigh on the choice:

- **Volume**: code-gloss is a personal glossary. The table holds a handful of seeded rows and will plausibly grow to hundreds, not tens of thousands.
- **The app already loads every glose**: `GET /api/gloses` and `GET /api/rss` both call `getGlosesInMemory()` (`SELECT * FROM gloses`), and the home page filters by theme in the browser with `filterByThemes`.
- **SQL would not avoid the scan**: a case-insensitive substring match (`ILIKE '%term%'`) on `title`, `description` and `tags` cannot use a B-tree index. Without a trigram or full-text index, Postgres reads the whole table either way. SQL filtering saves the transfer of the rows, not the read.
- **Where the matching rule lives**: "a glose matches when the text appears in its title, description or tags, ignoring case, and when it has one of the selected themes" is a business rule. In the use case, it is tested with an in-memory fake in milliseconds. In SQL, each case of the rule needs a testcontainers test, and the rule is split between the adapter and the core.
- **Consistency**: `filterByThemes` already defines what "matches a theme" means for the home page. Reusing it keeps the MCP tool and the UI in agreement.

## Decision

The port exposes a single read method:

```ts
export interface GloseReader {
    findAll(): Promise<GloseComplete[]>
}
```

The `searchGloses` use case loads every glose through the port, then filters by text (title, description and tags, case-insensitive) and by themes (reusing `filterByThemes`), and returns the matches. The MCP adapter applies the result limit and reports `total` and `truncated` (point 2 of `plans/improve-gloses-mcp.md`). `total` is simply the length of the filtered list.

The Postgres adapter (`pg-glose-reader.ts`) still maps each row to a valid `GloseComplete` (NULL text → `''`, NULL themes → `[]`, `Date` → ISO string), as required by point 1 of `plans/improve-gloses-mcp.md`. That mapping is needed whatever the port's shape.

## Consequences

**Positive**

- The matching rule lives in the core and is covered by fast unit tests with a fake `GloseReader`. Only the row mapping needs testcontainers.
- The port is minimal and the adapter is a thin wrapper around the existing `selectAllGloses`, which matches step 4 of the MCP plan.
- Theme matching is defined once (`filterByThemes`) for both the UI and the MCP tool.
- `total` for the truncation flag comes for free, with no second `COUNT` query.

**Negative / constraints**

- Each `search_gloses` call reads and transfers the whole `gloses` table. This is acceptable at the current volume, and it is what the app already does on every page load.
- The text matching is plain substring matching in JavaScript. Ranking, stemming and accent-insensitive search are not available without more work in the use case.

**When to revisit**

Revisit this decision if any of these becomes true:

- the table reaches several thousand rows, or `search_gloses` becomes noticeably slow;
- the search needs ranking, stemming or fuzzy matching, which Postgres full-text search (`tsvector`, `pg_trgm`) does better.

The fix is then a new port method, `search(criteria)`, backed by SQL, with the matching rule moved into the adapter's query. The MCP adapter only depends on the `searchGloses` use case, so it does not change.
