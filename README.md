# QueryRadar

Static analysis for ORM query problems — catches N+1 queries, accidental full-table
scans, `SELECT *` over-fetching, and missing-index patterns in **Entity Framework
Core** code, before they hit production.

QueryRadar is three pieces:

- **Engine** (`src/QueryRadar.Engine`) — a Roslyn-based analyzer. The value lives
  here: a registry of independent ORM rules, each detecting one anti-pattern.
- **API** (`src/QueryRadar.Api`) — an ASP.NET minimal API that runs the engine
  over a project and returns findings as JSON.
- **Dashboard** (`web/`) — a TypeScript + React UI that visualizes findings
  across a codebase and over CI history.

## Why this exists

Every backend team ships ORM code that is silently wrong or 100× too slow. The
existing tooling is weak and fragmented: runtime profilers catch N+1 only after
deploy, and there is no good static, EF-Core-aware analyzer. QueryRadar closes
that gap.

## Quick start

```bash
# analyze a solution from the CLI
dotnet run --project src/QueryRadar.Cli -- analyze /path/to/your/Solution.sln

# run the API
dotnet run --project src/QueryRadar.Api

# run the dashboard (talks to the API on :5080)
cd web && npm install && npm run dev
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). The one invariant that matters:
**one ORM anti-pattern = one `IOrmRule` implementation = one PR**. The engine,
frontends, and rules are independently extensible so the contribution surface
never runs dry.

## Contributing

New rules are the lifeblood of the project. The mechanical recipe is in
[docs/WRITING_A_RULE.md](docs/WRITING_A_RULE.md) — each open issue maps to exactly
one rule, with a fixture, a detector, and a test.

## License

MIT — see [LICENSE](LICENSE).
