using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Rules;

/// <summary>
/// QR0003 — eager-loading a collection navigation without a bound, risking a
/// cartesian explosion. STUB: depends on richer Include metadata on
/// <see cref="OrmQuery.Includes"/> + collection-navigation classification the
/// frontend does not produce yet. Tracked in the starter backlog.
/// </summary>
public sealed class UnboundedIncludeRule : IOrmRule
{
    public RuleMetadata Metadata { get; } = new(
        Id: "QR0003",
        Title: "Unbounded collection Include (cartesian explosion risk)",
        Severity: Severity.Warning,
        DocsUrl: "https://github.com/QueryRadar/QueryRadar/blob/main/docs/rules/QR0003.md");

    public IEnumerable<Finding> Analyze(OrmContext context)
    {
        yield break;
    }
}
