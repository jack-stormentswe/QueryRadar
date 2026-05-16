namespace QueryRadar.Engine.Rules;

/// <summary>
/// The set of rules a run applies. Adding a rule is one line here plus its own
/// file and test — the only shared-file change a rule PR makes.
/// </summary>
public sealed class RuleRegistry
{
    private readonly List<IOrmRule> _rules;

    public RuleRegistry(IEnumerable<IOrmRule> rules) => _rules = rules.ToList();

    public IReadOnlyList<IOrmRule> Rules => _rules;

    public static RuleRegistry Default() => new(new IOrmRule[]
    {
        new NPlusOneRule(),
        new SelectEntireEntityRule(),
        new UnboundedIncludeRule(),
    });
}
