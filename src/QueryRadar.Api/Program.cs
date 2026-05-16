using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Rules;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

var analyzer = Analyzer.Default();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

// The rule catalogue, so the dashboard can show capability without a run.
app.MapGet("/api/rules", () =>
    Results.Ok(RuleRegistry.Default().Rules.Select(r => new
    {
        ruleId = r.Metadata.Id,
        title = r.Metadata.Title,
        severity = r.Metadata.Severity.ToString(),
        docsUrl = r.Metadata.DocsUrl,
    })));

// POST a C# source body, get findings back. The dashboard calls this.
app.MapPost("/api/analyze", (AnalyzeRequest req) =>
{
    var result = analyzer.AnalyzeSource(req.Target ?? "input.cs", req.Source);
    return Results.Ok(new
    {
        target = result.Target,
        errorCount = result.ErrorCount,
        warningCount = result.WarningCount,
        findings = result.Findings.Select(f => new
        {
            ruleId = f.Rule.Id,
            title = f.Rule.Title,
            severity = f.Rule.Severity.ToString(),
            docsUrl = f.Rule.DocsUrl,
            file = f.Location.FilePath,
            line = f.Location.Line,
            column = f.Location.Column,
            message = f.Message,
        }),
    });
});

app.Run();

internal sealed record AnalyzeRequest(string Source, string? Target);
