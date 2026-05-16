import type { QueryModel } from './types';

export type LintLevel = 'warning' | 'info';

export interface QueryLint {
  id: string;
  level: LintLevel;
  message: string;
}

/**
 * Live query smells — the builder's own take on the project thesis: catch the
 * problem before it ships. Each rule is independent; adding one is one block.
 */
export function lintQuery(q: QueryModel): QueryLint[] {
  const lints: QueryLint[] = [];
  if (q.tables.length === 0) return lints;

  if (q.columns.length === 0) {
    lints.push({
      id: 'QB-SELECT-STAR',
      level: 'warning',
      message: 'No columns selected — this is a SELECT * and over-fetches.',
    });
  }

  // Tables on the canvas that are neither the FROM table nor connected by a
  // join produce a cartesian product.
  const joined = new Set<string>([q.tables[0]]);
  for (const j of q.joins) {
    joined.add(j.leftTable);
    joined.add(j.rightTable);
  }
  const dangling = q.tables.filter((t) => !joined.has(t));
  if (dangling.length > 0) {
    lints.push({
      id: 'QB-CARTESIAN',
      level: 'warning',
      message: `Table(s) ${dangling.join(', ')} have no join — cartesian product.`,
    });
  }

  if (q.filters.length === 0 && q.limit === null) {
    lints.push({
      id: 'QB-UNBOUNDED',
      level: 'warning',
      message: 'No WHERE and no LIMIT — full table scan returning every row.',
    });
  }

  if (q.orderBy.length > 0 && q.limit === null) {
    lints.push({
      id: 'QB-SORT-NO-LIMIT',
      level: 'info',
      message: 'ORDER BY without LIMIT sorts the entire result set.',
    });
  }

  for (const f of q.filters) {
    if (f.op === 'LIKE' && f.value.startsWith('%')) {
      lints.push({
        id: 'QB-LEADING-WILDCARD',
        level: 'info',
        message: `LIKE '${f.value}' has a leading wildcard — indexes can't be used.`,
      });
    }
  }

  return lints;
}
