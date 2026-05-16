import { useEffect, useState } from 'react';
import { fetchRules, type RuleInfo } from '../api/client';
import { SeverityBadge } from './SeverityBadge';

export function RulesView() {
  const [rules, setRules] = useState<RuleInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules()
      .then(setRules)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <div className="grid">
      <section className="card" style={{ gridColumn: '1 / -1' }}>
        <h2>Rule catalogue</h2>
        {error && <div className="err-banner">{error}</div>}
        {!rules && !error && <div className="empty"><p>Loading rules…</p></div>}
        {rules && (
          <table>
            <thead>
              <tr>
                <th>Rule</th>
                <th>Severity</th>
                <th>Title</th>
                <th>Docs</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.ruleId}>
                  <td className="loc">{r.ruleId}</td>
                  <td>
                    <SeverityBadge severity={r.severity} />
                  </td>
                  <td>{r.title}</td>
                  <td>
                    <a href={r.docsUrl} target="_blank" rel="noreferrer">
                      reference →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="hint">
          Rules are independent checks in the engine. New rules are
          contributions — each one row here maps to one detector.
        </p>
      </section>
    </div>
  );
}
