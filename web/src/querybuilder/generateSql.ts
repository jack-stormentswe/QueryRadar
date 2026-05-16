import type { QueryModel } from './types';

/** Pure: turn the visual model into a formatted SQL string. */
export function generateSql(q: QueryModel): string {
  if (q.tables.length === 0) return '-- add a table to begin';

  const cols =
    q.columns.length === 0
      ? '*'
      : q.columns.map((c) => `${c.table}.${c.column}`).join(',\n       ');

  const lines: string[] = [];
  lines.push(`SELECT ${q.distinct ? 'DISTINCT ' : ''}${cols}`);
  lines.push(`FROM ${q.tables[0]}`);

  for (const j of q.joins) {
    lines.push(
      `${j.type} JOIN ${j.rightTable} ` +
        `ON ${j.leftTable}.${j.leftColumn} = ${j.rightTable}.${j.rightColumn}`,
    );
  }

  q.filters.forEach((f, i) => {
    const keyword = i === 0 ? 'WHERE' : f.conjunction;
    const value =
      f.op === 'IN'
        ? `(${f.value})`
        : f.op === 'LIKE'
          ? `'${f.value}'`
          : /^-?\d+(\.\d+)?$/.test(f.value)
            ? f.value
            : `'${f.value}'`;
    lines.push(`${keyword} ${f.table}.${f.column} ${f.op} ${value}`);
  });

  if (q.orderBy.length > 0) {
    lines.push(
      'ORDER BY ' +
        q.orderBy.map((o) => `${o.table}.${o.column} ${o.dir}`).join(', '),
    );
  }

  if (q.limit !== null && q.limit > 0) {
    lines.push(`LIMIT ${q.limit}`);
  }

  return lines.join('\n') + ';';
}
