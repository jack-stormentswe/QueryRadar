import type { Schema, Table, Column } from './types';

/**
 * Forgiving CREATE TABLE parser. Handles the common shape:
 *
 *   CREATE TABLE [schema.]name (
 *     col TYPE [constraints...],
 *     ...
 *     [PRIMARY KEY (...)], [FOREIGN KEY ...], [CONSTRAINT ...]
 *   );
 *
 * Constraint-only lines are skipped; quoting (" ` [ ]) is stripped. This is a
 * pragmatic parser, not a full SQL grammar — unknown syntax is ignored rather
 * than throwing, so a paste of a real dump still yields a usable schema.
 */
export function parseDdl(ddl: string): { schema: Schema; errors: string[] } {
  const schema: Schema = [];
  const errors: string[] = [];

  const stmts = ddl.split(';');
  const re = /create\s+table\s+(?:if\s+not\s+exists\s+)?([^\s(]+)\s*\(([\s\S]*)\)/i;

  for (const stmt of stmts) {
    const m = stmt.match(re);
    if (!m) continue;

    const rawName = unquote(m[1]).split('.').pop() ?? m[1];
    const body = m[2];
    const columns: Column[] = [];

    for (const line of splitColumns(body)) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (isConstraintLine(trimmed)) continue;

      const parts = trimmed.split(/\s+/);
      const name = unquote(parts[0]);
      const type = (parts[1] ?? 'unknown').replace(/\(.*$/, '').toLowerCase();
      if (name) columns.push({ name, type });
    }

    if (columns.length === 0) {
      errors.push(`table "${rawName}" parsed with no columns`);
      continue;
    }

    const table: Table = { name: rawName, columns };
    schema.push(table);
  }

  if (schema.length === 0 && ddl.trim()) {
    errors.push('no CREATE TABLE statements recognized');
  }

  return { schema, errors };
}

function unquote(s: string): string {
  return s.replace(/^["`\[]+|["`\]]+$/g, '').trim();
}

function isConstraintLine(line: string): boolean {
  return /^(primary\s+key|foreign\s+key|constraint|unique|check|key|index)\b/i.test(
    line,
  );
}

/** Split the column body on commas that are not inside parentheses. */
function splitColumns(body: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of body) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(buf);
      buf = '';
    } else {
      buf += ch;
    }
  }
  if (buf.trim()) out.push(buf);
  return out;
}
