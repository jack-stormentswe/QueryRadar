using QueryRadar.Engine.Rules;

namespace QueryRadar.Engine.Model;

/// <summary>One detected problem: which rule, where, and what to do about it.</summary>
public sealed record Finding(
    RuleMetadata Rule,
    SourceLocation Location,
    string Message);
