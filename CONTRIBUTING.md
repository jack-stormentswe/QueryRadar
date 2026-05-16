# Contributing

Thanks for contributing to QueryRadar. Most contributions are **new rules** —
each is small, independent, and reviewable.

## Setup

```bash
dotnet build                 # build engine, api, cli, tests
dotnet test                  # run the engine test suite
cd web && npm install && npm run dev   # dashboard against the local API
```

Requires the .NET SDK pinned in `global.json` and Node 20+.

## What to work on

- **Add a rule** — the highest-value contribution. Recipe:
  [docs/WRITING_A_RULE.md](docs/WRITING_A_RULE.md). One rule = one PR.
- **Add a frontend** — support another ORM (Dapper, LINQ2DB) by populating
  `OrmContext`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
- **Extend `OrmContext`** — when a rule needs a signal the frontend doesn't
  expose yet. Keep this separate from rule PRs.
- **Dashboard** — `web/` only; never put analysis logic here.

## Ground rules

- One concern per PR. A rule PR adds a rule, its fixture, and its test —
  nothing else.
- Rules query `OrmContext`, never Roslyn directly.
- New behavior needs a test. New rules need a BAD fixture and a GOOD
  counter-example.
- `dotnet test` and `dotnet format --verify-no-changes` must pass; the web
  build (`npm run build`) must pass.

## PR checklist

- [ ] Scope is one rule / one frontend / one fix
- [ ] Tests added and green
- [ ] No false positive on the GOOD counter-example
- [ ] Public surface documented where it changed
