import { useMemo, useState } from 'react';
import { analyze, type AnalyzeResponse, type Finding } from './api/client';
import { FindingsTable } from './components/FindingsTable';
import { CodeEditor } from './components/CodeEditor';
import { Home } from './components/Home';
import { RulesView } from './components/RulesView';
import { QueryBuilder } from './querybuilder/QueryBuilder';
import { useLocalStorage } from './lib/useLocalStorage';

const SNIPPETS: { id: string; label: string; code: string }[] = [
  {
    id: 'nplus1',
    label: 'N+1 in a loop',
    code: `foreach (var id in ids)
{
    var rows = db.Orders
        .Where(o => o.Id == id)
        .ToList();
}`,
  },
  {
    id: 'clean',
    label: 'Single query (clean)',
    code: `var rows = db.Orders
    .Where(o => o.Status == "open")
    .ToList();

foreach (var r in rows)
{
    Console.WriteLine(r.Id);
}`,
  },
  {
    id: 'nested',
    label: 'Nested loop fetch',
    code: `foreach (var c in customers)
{
    for (int i = 0; i < c.OrderIds.Count; i++)
    {
        var order = db.Orders.First(o => o.Id == c.OrderIds[i]);
    }
}`,
  },
];

const ORMS = [
  { id: 'efcore', label: 'Entity Framework Core', enabled: true },
  { id: 'dapper', label: 'Dapper — via contribution', enabled: false },
  { id: 'sqlalchemy', label: 'SQLAlchemy — via contribution', enabled: false },
  { id: 'django', label: 'Django ORM — via contribution', enabled: false },
] as const;

type View = 'home' | 'analyzer' | 'builder' | 'rules';

const TABS: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'analyzer', label: 'Analyzer' },
  { id: 'builder', label: 'Query Builder' },
  { id: 'rules', label: 'Rules' },
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
            : view === 'builder'
              ? 'Visually compose a SELECT from your schema — tables, joins, filters, sort.'
              : 'Every check the engine ships, with links to the fix.'}
        </p>
      )}

      {view === 'home' && <Home onNavigate={setView} />}
      {view === 'analyzer' && <AnalyzerView />}
      {view === 'builder' && <QueryBuilder />}
      {view === 'rules' && <RulesView />}
    </div>
  );
}

type Sev = 'All' | 'Error' | 'Warning' | 'Info';

function AnalyzerView() {
  const [orm, setOrm] = useState('efcore');
  const [source, setSource] = useLocalStorage<string>(
    'qr.source',
    SNIPPETS[0].code,
  );
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<Sev>('All');
  const [goto, setGoto] = useState<{ line: number; nonce: number } | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      setResult(await analyze(source));
      setFilter('All');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const shown: Finding[] = useMemo(() => {
    if (!result) return [];
    return filter === 'All'
      ? result.findings
      : result.findings.filter((f) => f.severity === filter);
  }, [result, filter]);

  const infoCount = result
    ? result.findings.length - result.errorCount - result.warningCount
    : 0;

  function jump(line: number) {
    setGoto((g) => ({ line, nonce: (g?.nonce ?? 0) + 1 }));
  }

  return (
    <div className="grid">
      <section className="card">
        <div className="card-head">
          <h2>Source</h2>
          <div className="head-controls">
            <select
              className="orm-select"
              value=""
              onChange={(e) => {
                const s = SNIPPETS.find((x) => x.id === e.target.value);
                if (s) setSource(s.code);
              }}
            >
              <option value="">load example…</option>
              {SNIPPETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
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
        </div>
        <CodeEditor value={source} onChange={setSource} gotoLine={goto} />
        <p className="hint">
          Tab / Shift+Tab to indent · source is saved locally · only EF Core
          N+1 detection is active today (other rules are open contributions).
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
              <button
                className={`stat error${filter === 'Error' ? ' active' : ''}`}
                onClick={() => setFilter(filter === 'Error' ? 'All' : 'Error')}
              >
                <div className="n">{result.errorCount}</div>
                <div className="l">Errors</div>
              </button>
              <button
                className={`stat warning${filter === 'Warning' ? ' active' : ''}`}
                onClick={() =>
                  setFilter(filter === 'Warning' ? 'All' : 'Warning')
                }
              >
                <div className="n">{result.warningCount}</div>
                <div className="l">Warnings</div>
              </button>
              <button
                className={`stat${filter === 'Info' ? ' active' : ''}`}
                onClick={() => setFilter(filter === 'Info' ? 'All' : 'Info')}
              >
                <div className="n">{infoCount}</div>
                <div className="l">Info</div>
              </button>
            </div>
            {filter !== 'All' && (
              <button className="link clear-filter" onClick={() => setFilter('All')}>
                clear filter ({filter}) ✕
              </button>
            )}
            <FindingsTable findings={shown} onSelect={jump} />
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
