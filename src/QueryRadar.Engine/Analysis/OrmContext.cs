using Microsoft.CodeAnalysis;
using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Analysis;

/// <summary>
/// Normalized, ORM-agnostic view a rule analyzes. Frontends populate it from
/// Roslyn so rules never touch syntax/semantics directly.
/// </summary>
public sealed class OrmContext
{
    private readonly List<OrmQuery> _queries = new();

    public IReadOnlyList<OrmQuery> Queries => _queries;

    public void AddQuery(OrmQuery query) => _queries.Add(query);
}

/// <summary>
/// One ORM query call site, with the signals rules need. Frontends decide how
/// to fill these; rules only read them.
/// </summary>
public sealed record OrmQuery
{
    public required SourceLocation Location { get; init; }

    /// <summary>True if this query is materialized/enumerated inside a loop body.</summary>
    public bool InsideLoop { get; init; }

    /// <summary>True if a navigation property is accessed without an eager Include.</summary>
    public bool LazyNavigationAccess { get; init; }

    /// <summary>True if the query projects whole entities rather than a Select of needed columns.</summary>
    public bool ProjectsEntireEntity { get; init; }

    /// <summary>Eager-loaded navigation chains (Include/ThenInclude), if any.</summary>
    public IReadOnlyList<string> Includes { get; init; } = Array.Empty<string>();

    /// <summary>Raw Roslyn node, escape hatch for frontend authors only — rules must not use this.</summary>
    public SyntaxNode? SyntaxNode { get; init; }
}
