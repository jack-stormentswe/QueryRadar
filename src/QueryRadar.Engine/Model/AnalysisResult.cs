namespace QueryRadar.Engine.Model;

/// <summary>Outcome of one analysis run. Stable contract for API + dashboard.</summary>
public sealed record AnalysisResult(
    string Target,
    IReadOnlyList<Finding> Findings)
{
    public int ErrorCount => Findings.Count(f => f.Rule.Severity == Severity.Error);
    public int WarningCount => Findings.Count(f => f.Rule.Severity == Severity.Warning);

    public static AnalysisResult Empty(string target) => new(target, Array.Empty<Finding>());
}
