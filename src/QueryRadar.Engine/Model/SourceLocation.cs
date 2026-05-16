namespace QueryRadar.Engine.Model;

/// <summary>A 1-based file position a finding points at.</summary>
public sealed record SourceLocation(string FilePath, int Line, int Column)
{
    public override string ToString() => $"{FilePath}:{Line}:{Column}";
}
