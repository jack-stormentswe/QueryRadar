import type { Schema } from './types';

export function SchemaPanel({
  schema,
  placed,
  onAdd,
}: {
  schema: Schema;
  placed: string[];
  onAdd: (table: string) => void;
}) {
  return (
    <div className="qb-schema">
      <h3>Schema</h3>
      {schema.map((t) => {
        const on = placed.includes(t.name);
        return (
          <div key={t.name} className="qb-schema-table">
            <div className="qb-schema-head">
              <span className="qb-tname">{t.name}</span>
              <button
                className="qb-mini"
                disabled={on}
                onClick={() => onAdd(t.name)}
              >
                {on ? 'on canvas' : '+ add'}
              </button>
            </div>
            <ul className="qb-schema-cols">
              {t.columns.map((c) => (
                <li key={c.name}>
                  <span>{c.name}</span>
                  <span className="qb-ctype">{c.type}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
