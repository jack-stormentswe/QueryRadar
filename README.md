# QueryRadar

Catch slow and wrong database queries **before** they ship.

QueryRadar is two tools sharing one thesis — *find the bad query early*:

- **Analyzer** — static analysis of Entity Framework Core code for N+1
  queries, over-fetching and full scans (Roslyn-powered).
- **Visual Query Builder** — compose a `SELECT` from your schema (tables,
  joins, filters, sort) with live SQL generation and live "query smell"
  checks as you build.

Everything runs locally. No database connection, no telemetry.

## The app

A single-page dashboard with four views:

| View | What it does |
|---|---|
| **Home** | Landing page / overview |
| **Analyzer** | Paste EF Core code → findings. Example snippets, source persisted locally, click a severity card to filter, click a finding to jump to the line. |
| **Query Builder** | Import your schema from `CREATE TABLE` DDL (or use the sample), click tables/columns onto a canvas, add joins/filters/sort, watch SQL build live, get smell warnings (cartesian joins, unbounded scans, leading wildcards). Schema + query persist locally. |
| **Rules** | The engine's full rule catalogue, pulled live from the API. |

## Pieces

- **`src/QueryRadar.Engine`** — Roslyn-based analyzer: a registry of
  independent ORM rules, each detecting one anti-pattern. The value lives here.
- **`src/QueryRadar.Api`** — ASP.NET minimal API.
  `POST /api/analyze` (source → findings) and `GET /api/rules` (rule catalogue).
- **`src/QueryRadar.Cli`** — analyze a single `.cs` file from the terminal.
- **`web/`** — TypeScript + React (Vite) dashboard. The Query Builder is
  pure client-side; the Analyzer/Rules views call the API.

## Quick start

```bash
# 1. API (serves on http://localhost:5080)
dotnet run --project src/QueryRadar.Api

# 2. dashboard (http://localhost:5173, proxies /api to :5080)
cd web && npm install && npm run dev

# CLI: analyze one C# file
dotnet run --project src/QueryRadar.Cli -- analyze ./path/to/File.cs
```

Build & test everything:

```bash
dotnet build && dotnet test
cd web && npm run build
```

## Status

The **N+1 detector (`QR0001`) is implemented and tested**. The other rules,
additional ORM frontends (Dapper, SQLAlchemy, …), solution-wide analysis, and
the richer query-builder features are intentionally open — each is a small,
self-contained unit. See [docs/BACKLOG.md](docs/BACKLOG.md).

## Architecture

[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The invariant that keeps the
codebase contributable: **one ORM anti-pattern = one `IOrmRule` = one PR**,
with one fixture and one test. Engine, frontends and rules extend
independently.

## Contributing

New rules are the lifeblood of the project. The mechanical recipe —
fixture → detector → registration → test — is in
[docs/WRITING_A_RULE.md](docs/WRITING_A_RULE.md). See also
[CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
