# Architecture

QueryRadar is deliberately layered so the contribution surface decomposes into
small, independent units. The whole design exists to make this true:

> **one ORM anti-pattern = one `IOrmRule` = one PR = one fixture + one test**

## Layers

```
                    ┌──────────────────────────┐
  web/  (React+TS)  │  Dashboard               │  visualizes findings
                    └────────────┬─────────────┘
                                 │ HTTP/JSON
                    ┌────────────┴─────────────┐
  QueryRadar.Api    │  Minimal API             │  POST a project → findings
                    └────────────┬─────────────┘
                                 │ in-process
                    ┌────────────┴─────────────┐
  QueryRadar.Engine │  Analyzer                │  orchestrates a run
                    │   ├── Frontends          │  detect ORM constructs (Roslyn)
                    │   ├── OrmContext         │  normalized view rules query
                    │   └── RuleRegistry       │  all IOrmRule implementations
                    └──────────────────────────┘
  QueryRadar.Cli    │  thin console wrapper over the Engine
```

## Component responsibilities

### `Frontends/` — ORM detection

A `IOrmFrontend` turns raw Roslyn syntax/semantics into a normalized
`OrmContext`: which symbols are `DbContext`s, which call sites are queries,
which are inside loops, which materialize (`ToList`, `First`, enumeration).

`EfCoreFrontend` is the first frontend. A future `Dapper` or `LINQ2DB`
frontend is an independent unit — it only has to populate `OrmContext`.

**Backlog axis:** one frontend per ORM.

### `OrmContext` — the rule-facing model

Rules never touch Roslyn directly. They query `OrmContext`:
materialization sites, loop scopes, projected columns, navigation-property
accesses, tracked vs. no-tracking queries. Keeping rules off Roslyn is what
makes a rule a ~40-line, reviewable, one-PR change.

### `Rules/` — the anti-pattern detectors

Each rule implements `IOrmRule`:

```csharp
public interface IOrmRule
{
    RuleMetadata Metadata { get; }
    IEnumerable<Finding> Analyze(OrmContext context);
}
```

Stateless, independent, registered once in `RuleRegistry`. Adding a rule
touches one new file + one test + one fixture. Nothing else.

**Backlog axis:** one rule per anti-pattern (N+1, select-*, missing index hint,
unbounded `Include`, client-side evaluation, cartesian explosion, …).

### `Model/` — findings

`Finding` (rule id, severity, `SourceLocation`, message, fix hint) →
`AnalysisResult`. This is the stable contract the API serializes and the
dashboard renders. Changing it is rare and deliberate.

### `Api` / `web` — presentation only

The API has no analysis logic; it adapts `AnalysisResult` to JSON. The
dashboard has no analysis logic; it renders JSON. Frontend churn never
touches the engine, and engine work never touches the frontend — the two
contributor pools stay separate.

## Why this shape

A flat analyzer would mean every change touches a shared core and PRs
conflict. This layering means dozens of contributors can each add a rule or a
frontend in parallel without stepping on each other — which is the only way an
issue backlog stays both deep and mergeable over time.
