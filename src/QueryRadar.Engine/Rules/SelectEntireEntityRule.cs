using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Rules;

/// <summary>
/// QR0002 — over-fetching: the query returns whole entities when a projection
/// of the needed columns would do. STUB: depends on
/// <see cref="OrmQuery.ProjectsEntireEntity"/>, which the EF Core frontend does
/// not populate yet. Tracked as "extend OrmContext: projection detection".
/// </summary>
public sealed class SelectEntireEntityRule : IOrmRule
{
    public RuleMetadata Metadata { get; } = new(
        Id: "QR0002",
        Title: "Query fetches entire entity instead of a projection",
        Severity: Severity.Info,
        DocsUrl: "https://github.com/QueryRadar/QueryRadar/blob/main/docs/rules/QR0002.md");

    public IEnumerable<Finding> Analyze(OrmContext context)
    {
        foreach (var query in context.Queries)
        {
            if (!query.ProjectsEntireEntity)
                continue;

            yield return new Finding(
                Metadata,
                query.Location,
                "Query materializes whole entities. If only a few columns are used, "
                + "add a .Select(...) projection to reduce I/O and memory.");
        }
    }
}
