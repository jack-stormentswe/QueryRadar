import type { QueryLint } from './lintQuery';

export function LintPanel({ lints }: { lints: QueryLint[] }) {
  return (
    <div className="qb-lint">
      <div className="qb-sec-head">
        <h3>Query checks</h3>
        <span className="qb-lint-count">{lints.length}</span>
      </div>
      {lints.length === 0 ? (
        <p className="qb-lint-ok">✓ No query smells detected.</p>
      ) : (
        <ul className="qb-lint-list">
          {lints.map((l) => (
            <li key={l.id} className={`qb-lint-item ${l.level}`}>
              <span className="qb-lint-tag">{l.level}</span>
              {l.message}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
