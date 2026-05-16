import type { Schema, SelectedColumn } from './types';

export function TableCard({
  schema,
  table,
  isFrom,
  selected,
  onToggleColumn,
  onRemove,
}: {
  schema: Schema;
  table: string;
  isFrom: boolean;
  selected: SelectedColumn[];
  onToggleColumn: (table: string, column: string) => void;
  onRemove: (table: string) => void;
}) {
  const cols = schema.find((t) => t.name === table)?.columns ?? [];
  const isChecked = (col: string) =>
    selected.some((s) => s.table === table && s.column === col);

  return (
    <div className="qb-card">
      <div className="qb-card-head">
        <span className="qb-tname">{table}</span>
        {isFrom ? (
          <span className="qb-from-tag">FROM</span>
        ) : (
          <button className="qb-mini" onClick={() => onRemove(table)}>
            remove
          </button>
        )}
      </div>
      <ul className="qb-card-cols">
        {cols.map((c) => (
          <li key={c.name}>
            <label>
              <input
                type="checkbox"
                checked={isChecked(c.name)}
                onChange={() => onToggleColumn(table, c.name)}
              />
              <span>{c.name}</span>
              <span className="qb-ctype">{c.type}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
