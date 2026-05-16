import type { Finding } from '../api/client';
import { SeverityBadge } from './SeverityBadge';

export function FindingsTable({
  findings,
  onSelect,
}: {
  findings: Finding[];
  onSelect?: (line: number) => void;
}) {
  if (findings.length === 0) {
    return (
      <div className="empty">
        <div className="ok">✓</div>
        <p>No findings.</p>
      </div>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          <th>Rule</th>
          <th>Severity</th>
          <th>Location</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {findings.map((f, i) => (
          <tr
            key={i}
            className={onSelect ? 'clickable' : undefined}
            onClick={() => onSelect?.(f.line)}
          >
            <td>
              <a
                href={f.docsUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {f.ruleId}
              </a>
            </td>
            <td>
              <SeverityBadge severity={f.severity} />
            </td>
            <td className="loc">
              {f.file}:{f.line}:{f.column}
            </td>
            <td>{f.message}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
