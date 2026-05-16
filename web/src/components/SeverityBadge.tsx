import type { Finding } from '../api/client';

export function SeverityBadge({ severity }: { severity: Finding['severity'] }) {
  return <span className={`badge ${severity.toLowerCase()}`}>{severity}</span>;
}
