using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Rules;

/// <summary>Static identity of a rule. Stable across runs; serialized into findings.</summary>
public sealed record RuleMetadata(
    string Id,
    string Title,
    Severity Severity,
    string DocsUrl);
