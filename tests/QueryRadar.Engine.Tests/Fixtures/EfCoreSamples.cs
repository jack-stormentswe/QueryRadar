namespace QueryRadar.Engine.Tests.Fixtures;

/// <summary>
/// Inline C# sources exercising rules. Each rule ships a BAD sample (must
/// produce exactly one finding) and a GOOD counter-example (must produce none).
/// </summary>
public static class EfCoreSamples
{
    // QR0001 BAD: ToList() materialized inside a foreach -> N+1.
    public const string NPlusOneBad = """
        using System.Collections.Generic;
        class C
        {
            void M(DbSet orders)
            {
                foreach (var id in new[] { 1, 2, 3 })
                {
                    var rows = orders.Where(o => o.Id == id).ToList();
                }
            }
        }
        class DbSet { public DbSet Where(System.Func<O, bool> p) => this; public List<O> ToList() => new(); }
        class O { public int Id; }
        """;

    // QR0001 GOOD: single materialization outside any loop.
    public const string NPlusOneGood = """
        using System.Collections.Generic;
        class C
        {
            void M(DbSet orders)
            {
                var rows = orders.Where(o => o.Id > 0).ToList();
                foreach (var r in rows) { }
            }
        }
        class DbSet { public DbSet Where(System.Func<O, bool> p) => this; public List<O> ToList() => new(); }
        class O { public int Id; }
        """;
}
