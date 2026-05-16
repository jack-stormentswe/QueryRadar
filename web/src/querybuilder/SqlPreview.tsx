import { useState } from 'react';

export function SqlPreview({ sql }: { sql: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="qb-sql">
      <div className="qb-sec-head">
        <h3>Generated SQL</h3>
        <button className="qb-mini" onClick={copy}>
          {copied ? 'copied ✓' : 'copy'}
        </button>
      </div>
      <pre>{sql}</pre>
    </div>
  );
}
