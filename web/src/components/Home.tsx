type View = 'home' | 'analyzer' | 'builder';

export function Home({ onNavigate }: { onNavigate: (v: View) => void }) {
  return (
    <div className="home">
      <section className="hero">
        <span className="hero-eyebrow">ORM query intelligence</span>
        <h2 className="hero-title">
          Catch slow and wrong database queries
          <br />
          before they ship.
        </h2>
        <p className="hero-sub">
          QueryRadar statically analyzes ORM code for N+1 queries,
          over-fetching and full scans — and lets you compose correct SQL
          visually, with smell-checks as you build.
        </p>
        <div className="hero-cta">
          <button className="btn" onClick={() => onNavigate('analyzer')}>
            Analyze code
          </button>
          <button className="btn ghost" onClick={() => onNavigate('builder')}>
            Open query builder
          </button>
        </div>
      </section>

      <section className="features">
        <article className="feature">
          <div className="feature-icon">⚠</div>
          <h3>Static analyzer</h3>
          <p>
            Roslyn-powered detection of EF Core anti-patterns. Each rule is an
            independent check with a documented fix.
          </p>
          <button className="link" onClick={() => onNavigate('analyzer')}>
            Try the analyzer →
          </button>
        </article>

        <article className="feature">
          <div className="feature-icon">⌗</div>
          <h3>Visual query builder</h3>
          <p>
            Compose a SELECT from your schema — tables, joins, filters, sort —
            and watch the SQL generate live.
          </p>
          <button className="link" onClick={() => onNavigate('builder')}>
            Build a query →
          </button>
        </article>

        <article className="feature">
          <div className="feature-icon">✓</div>
          <h3>Smell checks built in</h3>
          <p>
            The builder flags cartesian joins, unbounded scans and leading
            wildcards while you work — not after.
          </p>
          <button className="link" onClick={() => onNavigate('builder')}>
            See the checks →
          </button>
        </article>
      </section>

      <footer className="home-foot">
        Import your own schema via <code>CREATE TABLE</code> DDL · everything
        runs locally · MIT licensed
      </footer>
    </div>
  );
}
