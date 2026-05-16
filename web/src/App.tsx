import { useState } from 'react';
import { analyze, type AnalyzeResponse } from './api/client';
import { FindingsTable } from './components/FindingsTable';
import { CodeEditor } from './components/CodeEditor';
import { Home } from './components/Home';
import { QueryBuilder } from './querybuilder/QueryBuilder';

const SAMPLE = `foreach (var id in ids)
{
    var rows = db.Orders
        .Where(o => o.Id == id)
        .ToList();
}`;

const ORMS = [
  { id: 'efcore', label: 'Entity Framework Core', enabled: true },
  { id: 'dapper', label: 'Dapper — via contribution', enabled: false },
  { id: 'sqlalchemy', label: 'SQLAlchemy — via contribution', enabled: false },
  { id: 'django', label: 'Django ORM — via contribution', enabled: false },
] as const;

type View = 'home' | 'analyzer' | 'builder';

const TABS: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'analyzer', label: 'Analyzer' },
  { id: 'builder', label: 'Query Builder' },
];

export function App() {
  const [view, setView] = useState<View>('home');

  return (
    <div className="shell">
      <div className="topbar">
        <button className="brand" onClick={() => setView('home')}>
          <span className="logo">Q</span>
          <h1>QueryRadar</h1>
        </button>
        <nav className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={view === t.id ? 'tab on' : 'tab'}
              onClick={() => setView(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {view !== 'home' && (
        <p className="subtitle">
          {view === 'analyzer'
            ? 'Static analysis for ORM query problems — N+1, over-fetching, full scans.'
            : 'Visually compose a SELECT from your schema — tables, joins, filters, sort.'}
        </p>
      )}

      {view === 'home' && <Home onNavigate={setView} />}
      {view === 'analyzer' && <AnalyzerView />}
      {view === 'builder' && <QueryBuilder />}
    </div>
  );
}

function AnalyzerView() {
  const [orm, setOrm] = useState('efcore');
  const [source, setSource] = useState(SAMPLE);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setResult(await analyze(source));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <div className="card-head">
          <h2>Source</h2>
          <select
            className="orm-select"
            value={orm}
            onChange={(e) => setOrm(e.target.value)}
          >
            {ORMS.map((o) => (
              <option key={o.id} value={o.id} disabled={!o.enabled}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <CodeEditor value={source} onChange={setSource} />
        <p className="hint">
          Tab / Shift+Tab to indent. Only Entity Framework Core is analyzed
          today — other ORMs are open contributions.
        </p>
        <button className="btn" onClick={run} disabled={busy}>
          {busy ? 'Analyzing…' : 'Analyze'}
        </button>
        {error && <div className="err-banner">{error}</div>}
      </section>

      <section className="card">
        <h2>Findings</h2>
        {result ? (
          <>
            <div className="stats">
              <div className="stat error">
                <div className="n">{result.errorCount}</div>
                <div className="l">Errors</div>
              </div>
              <div className="stat warning">
                <div className="n">{result.warningCount}</div>
                <div className="l">Warnings</div>
              </div>
              <div className="stat">
                <div className="n">{result.findings.length}</div>
                <div className="l">Total</div>
              </div>
            </div>
            <FindingsTable findings={result.findings} />
          </>
        ) : (
          <div className="empty">
            <p>Run an analysis to see findings.</p>
          </div>
        )}
      </section>
    </div>
  );
}
