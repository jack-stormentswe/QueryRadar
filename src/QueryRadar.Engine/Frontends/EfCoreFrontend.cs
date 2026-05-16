using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using QueryRadar.Engine.Analysis;
using QueryRadar.Engine.Model;

namespace QueryRadar.Engine.Frontends;

/// <summary>
/// Entity Framework Core frontend. SKELETON: detects materialization calls
/// (ToList/ToArray/First/Single) and whether they sit inside a loop. The
/// richer signals (lazy navigation, projection, includes) are tracked issues
/// — see docs/WRITING_A_RULE.md and the starter backlog.
/// </summary>
public sealed class EfCoreFrontend : IOrmFrontend
{
    private static readonly HashSet<string> Materializers = new()
    {
        "ToList", "ToListAsync", "ToArray", "ToArrayAsync",
        "First", "FirstAsync", "FirstOrDefault", "FirstOrDefaultAsync",
        "Single", "SingleAsync", "SingleOrDefault", "SingleOrDefaultAsync",
    };

    public string OrmName => "EntityFrameworkCore";

    public void Populate(OrmContext context, SemanticModel model, SyntaxNode root)
    {
        foreach (var invocation in root.DescendantNodes().OfType<InvocationExpressionSyntax>())
        {
            if (invocation.Expression is not MemberAccessExpressionSyntax member)
                continue;
            if (!Materializers.Contains(member.Name.Identifier.Text))
                continue;

            var span = invocation.GetLocation().GetLineSpan();
            context.AddQuery(new OrmQuery
            {
                Location = new SourceLocation(
                    span.Path,
                    span.StartLinePosition.Line + 1,
                    span.StartLinePosition.Character + 1),
                InsideLoop = IsInsideLoop(invocation),
                SyntaxNode = invocation,
            });
        }
    }

    private static bool IsInsideLoop(SyntaxNode node)
    {
        for (var p = node.Parent; p is not null; p = p.Parent)
            if (p is ForEachStatementSyntax or ForStatementSyntax
                or WhileStatementSyntax or DoStatementSyntax)
                return true;
        return false;
    }
}
