using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Tests.Fixtures;
using Xunit;

namespace QueryRadar.Engine.Tests;

public sealed class NPlusOneRuleTests
{
    private readonly Analyzer _analyzer = Analyzer.Default();

    [Fact]
    public void Bad_sample_produces_exactly_one_QR0001_finding()
    {
        var result = _analyzer.AnalyzeSource("bad.cs", EfCoreSamples.NPlusOneBad);

        var qr0001 = result.Findings.Where(f => f.Rule.Id == "QR0001").ToList();
        Assert.Single(qr0001);
        Assert.Contains("N+1", qr0001[0].Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Good_counter_example_produces_no_QR0001_finding()
    {
        var result = _analyzer.AnalyzeSource("good.cs", EfCoreSamples.NPlusOneGood);

        Assert.DoesNotContain(result.Findings, f => f.Rule.Id == "QR0001");
    }
}
