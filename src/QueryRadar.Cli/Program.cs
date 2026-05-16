using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Model;

if (args.Length < 2 || args[0] != "analyze")
{
    Console.Error.WriteLine("usage: queryradar analyze <file.cs | path>");
    return 64;
}

var target = args[1];
if (!File.Exists(target))
{
    Console.Error.WriteLine($"not found: {target}");
    return 66;
}

var analyzer = Analyzer.Default();
var result = analyzer.AnalyzeSource(target, await File.ReadAllTextAsync(target));

foreach (var finding in result.Findings)
    Console.WriteLine($"{finding.Location}  [{finding.Rule.Id} {finding.Rule.Severity}]  {finding.Message}");

Console.WriteLine(
    $"\n{result.Findings.Count} finding(s): "
    + $"{result.ErrorCount} error, {result.WarningCount} warning");

return result.ErrorCount > 0 ? 1 : 0;
