export interface Finding {
  ruleId: string;
  title: string;
  severity: 'Info' | 'Warning' | 'Error';
  docsUrl: string;
  file: string;
  line: number;
  column: number;
  message: string;
}

export interface AnalyzeResponse {
  target: string;
  errorCount: number;
  warningCount: number;
  findings: Finding[];
}

export async function analyze(source: string): Promise<AnalyzeResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source, target: 'input.cs' }),
  });
  if (!res.ok) throw new Error(`analyze failed: ${res.status}`);
  return res.json();
}
