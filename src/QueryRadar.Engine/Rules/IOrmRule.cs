using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Rules;

/// <summary>
/// One anti-pattern detector. Stateless, independent, registered once. A rule
/// reads <see cref="OrmContext"/> only — never Roslyn directly.
/// </summary>
public interface IOrmRule
{
    RuleMetadata Metadata { get; }

    IEnumerable<Finding> Analyze(OrmContext context);
}
