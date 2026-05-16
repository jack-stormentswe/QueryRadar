# Starter Backlog

Each line is one issue = one PR. Rule issues follow
[docs/WRITING_A_RULE.md](WRITING_A_RULE.md). This is the seed; the backlog grows
one anti-pattern at a time and never runs dry.

## Frontend signals (unblock the stub rules)

These extend `OrmContext`/`EfCoreFrontend`. Each is independent.

- [ ] FE-1: detect lazy navigation-property access without a matching `Include` → set `OrmQuery.LazyNavigationAccess`
- [ ] FE-2: detect whole-entity materialization vs `.Select(...)` projection → set `OrmQuery.ProjectsEntireEntity`
- [ ] FE-3: capture `Include`/`ThenInclude` chains → populate `OrmQuery.Includes`
- [ ] FE-4: classify a navigation as collection vs reference (needed by QR0003)
- [ ] FE-5: resolve `DbContext`/`DbSet<T>` symbols semantically (drop the text heuristic)
- [ ] FE-6: track `AsNoTracking()` on a query

## Rules (each: rule + BAD fixture + GOOD counter-example + test)

- [x] QR0001 N+1: query materialized inside a loop *(reference rule, done)*
- [ ] QR0002 over-fetch: whole entity instead of projection *(needs FE-2)*
- [ ] QR0003 unbounded collection `Include` (cartesian risk) *(needs FE-3, FE-4)*
- [ ] QR0004 `.Where(...)` after client-side `.ToList()` (client evaluation)
- [ ] QR0005 `.Count()` then `.ToList()` on the same query (double round-trip)
- [ ] QR0006 `.OrderBy` without a `.Take`/paging on an unbounded set
- [ ] QR0007 `.First()` where `.FirstOrDefault()` is intended (throws on empty)
- [ ] QR0008 async query awaited synchronously (`.Result`/`.Wait()`)
- [ ] QR0009 `SaveChanges` called inside a loop (batch instead)
- [ ] QR0010 implicit transaction per row vs one explicit transaction
- [ ] QR0011 string-interpolated SQL in `FromSqlRaw` (injection)
- [ ] QR0012 missing `AsNoTracking()` on a read-only query
- [ ] QR0013 `.Any()` vs `.Count() > 0`
- [ ] QR0014 navigation accessed after context disposed
- [ ] QR0015 `GroupBy` evaluated client-side

## Engine / infra

- [ ] solution-level analysis via MSBuildWorkspace (CLI `analyze <.sln>`)
- [ ] severity config + per-rule suppression / baseline file
- [ ] SARIF reporter for GitHub code scanning
- [ ] `dotnet tool` packaging
- [ ] pre-commit hook + GitHub Action wrapper

## Frontends (future ORMs)

- [ ] Dapper frontend (raw SQL string analysis)
- [ ] LINQ2DB frontend
- [ ] (later) Python bridge: Django / SQLAlchemy via a separate analyzer process
