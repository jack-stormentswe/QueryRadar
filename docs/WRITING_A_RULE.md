# Writing a Rule

Every rule is an independent, one-PR contribution. Follow this recipe exactly;
each open "add rule: X" issue maps to these five steps.

## 1. Pick the anti-pattern

One rule detects exactly one anti-pattern. If you find yourself writing two
detectors, that is two rules and two PRs.

## 2. Add a fixture

Create a minimal EF Core sample that *exhibits* the anti-pattern, plus a
"clean" counter-example that must NOT trigger, under
`tests/QueryRadar.Engine.Tests/Fixtures/`.

```csharp
// BAD: navigation access inside a loop -> N+1
foreach (var order in db.Orders.ToList())
    Console.WriteLine(order.Customer.Name);   // lazy load per iteration

// GOOD: eager load
foreach (var order in db.Orders.Include(o => o.Customer).ToList())
    Console.WriteLine(order.Customer.Name);
```

## 3. Implement `IOrmRule`

One file in `src/QueryRadar.Engine/Rules/<Name>Rule.cs`. Query `OrmContext`
only — never touch Roslyn directly (that is the frontend's job).

```csharp
public sealed class MyRule : IOrmRule
{
    public RuleMetadata Metadata { get; } = new(
        Id: "QR0042",
        Title: "Short imperative description",
        Severity: Severity.Warning,
        DocsUrl: "https://github.com/<you>/QueryRadar/blob/main/docs/rules/QR0042.md");

    public IEnumerable<Finding> Analyze(OrmContext context)
    {
        foreach (var q in context.Queries)
            if (/* the anti-pattern condition, expressed over OrmContext */)
                yield return new Finding(Metadata, q.Location,
                    "Why this is a problem and what to do instead.");
    }
}
```

## 4. Register it

Add one line to `RuleRegistry.Default`. That is the only shared-file change.

## 5. Test it

`tests/QueryRadar.Engine.Tests/<Name>RuleTests.cs`: assert the BAD fixture
produces exactly one finding at the right location, and the GOOD fixture
produces none.

## Acceptance checklist (put this in every rule PR)

- [ ] Detects only the one documented anti-pattern
- [ ] BAD fixture → one finding; GOOD fixture → zero
- [ ] No false positive on the GOOD counter-example
- [ ] Rule reads `OrmContext` only, no direct Roslyn use
- [ ] Registered in `RuleRegistry.Default`
- [ ] `dotnet test` green

If you need data the rule can't get from `OrmContext`, that is a separate
"extend OrmContext / frontend" issue — open it; don't widen the rule PR.
