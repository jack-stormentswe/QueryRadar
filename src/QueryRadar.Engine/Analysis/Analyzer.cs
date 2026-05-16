using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using QueryRadar.Engine.Frontends;
using QueryRadar.Engine.Model;
using QueryRadar.Engine.Rules;

namespace QueryRadar.Engine.Analysis;

/// <summary>
/// Orchestrates a run: parse sources, let frontends populate an OrmContext,
/// then apply every registered rule. No analysis logic lives here — it only
/// wires frontends to rules.
/// </summary>
public sealed class Analyzer
{
    private readonly IReadOnlyList<IOrmFrontend> _frontends;
    private readonly RuleRegistry _rules;

    public Analyzer(IReadOnlyList<IOrmFrontend> frontends, RuleRegistry rules)
    {
        _frontends = frontends;
        _rules = rules;
    }

    public static Analyzer Default() => new(
        new IOrmFrontend[] { new EfCoreFrontend() },
        RuleRegistry.Default());

    /// <summary>Analyze in-memory source. Used by tests and the API.</summary>
    public AnalysisResult AnalyzeSource(string target, string sourceCode)
    {
        var tree = CSharpSyntaxTree.ParseText(sourceCode, path: target);
        var compilation = CSharpCompilation.Create(
            "QueryRadar.Adhoc",
            new[] { tree },
            new[] { MetadataReference.CreateFromFile(typeof(object).Assembly.Location) });
        var model = compilation.GetSemanticModel(tree);

        var context = new OrmContext();
        foreach (var frontend in _frontends)
            frontend.Populate(context, model, tree.GetRoot());

        var findings = _rules.Rules
            .SelectMany(rule => rule.Analyze(context))
            .OrderBy(f => f.Location.Line)
            .ToList();

        return new AnalysisResult(target, findings);
    }
}
