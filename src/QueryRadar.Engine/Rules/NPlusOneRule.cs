using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Rules;

/// <summary>
/// QR0001 — query materialized inside a loop. The canonical N+1 shape: a
/// collection is enumerated and a per-row query/navigation runs each iteration.
/// This is the fully-worked reference rule; copy its structure for new rules.
/// </summary>
public sealed class NPlusOneRule : IOrmRule
{
    public RuleMetadata Metadata { get; } = new(
        Id: "QR0001",
        Title: "Query materialized inside a loop (N+1)",
        Severity: Severity.Warning,
        DocsUrl: "https://github.com/QueryRadar/QueryRadar/blob/main/docs/rules/QR0001.md");

    public IEnumerable<Finding> Analyze(OrmContext context)
    {
        foreach (var query in context.Queries)
        {
            if (!query.InsideLoop)
                continue;

            yield return new Finding(
                Metadata,
                query.Location,
                "ORM query is materialized inside a loop, producing one round-trip "
                + "per iteration (N+1). Move the query out of the loop, or eager-load "
                + "with Include/projection so the data is fetched in a single query.");
        }
    }
}
