using Microsoft.CodeAnalysis;
using QueryRadar.Engine.Analysis;

namespace QueryRadar.Engine.Frontends;

/// <summary>
/// Detects one ORM's query constructs in a compilation and records them on the
/// shared <see cref="OrmContext"/>. One frontend per ORM; adding one is an
/// independent unit of work.
/// </summary>
public interface IOrmFrontend
{
    string OrmName { get; }

    void Populate(OrmContext context, SemanticModel model, SyntaxNode root);
}
