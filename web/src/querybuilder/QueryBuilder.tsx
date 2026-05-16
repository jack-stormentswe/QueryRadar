import { useMemo } from 'react';
import { sampleSchema } from './sampleSchema';
import { emptyQuery, type QueryModel, type Schema } from './types';
import { generateSql } from './generateSql';
import { columnsOf } from './utils';
import { useLocalStorage } from './useLocalStorage';
import { lintQuery } from './lintQuery';
import { SchemaPanel } from './SchemaPanel';
import { SchemaImport } from './SchemaImport';
import { TableCard } from './TableCard';
import { ConditionsEditor } from './ConditionsEditor';
import { SqlPreview } from './SqlPreview';
import { LintPanel } from './LintPanel';

export function QueryBuilder() {
  const [schema, setSchema] = useLocalStorage<Schema>('qr.schema', sampleSchema);
  const [query, setQuery] = useLocalStorage<QueryModel>('qr.query', emptyQuery);

  const sql = useMemo(() => generateSql(query), [query]);
  const lints = useMemo(() => lintQuery(query), [query]);

  function replaceSchema(next: Schema) {
    setSchema(next);
    setQuery(emptyQuery);
  }

  function addTable(table: string) {
    if (query.tables.includes(table)) return;
    setQuery({ ...query, tables: [...query.tables, table] });
  }

  function removeTable(table: string) {
    setQuery({
      ...query,
      tables: query.tables.filter((t) => t !== table),
      columns: query.columns.filter((c) => c.table !== table),
      joins: query.joins.filter(
        (j) => j.leftTable !== table && j.rightTable !== table,
      ),
      filters: query.filters.filter((f) => f.table !== table),
      orderBy: query.orderBy.filter((o) => o.table !== table),
    });
  }

  function toggleColumn(table: string, column: string) {
    const exists = query.columns.some(
      (c) => c.table === table && c.column === column,
    );
    setQuery({
      ...query,
      columns: exists
        ? query.columns.filter(
            (c) => !(c.table === table && c.column === column),
          )
        : [...query.columns, { table, column }],
    });
  }

  function selectAll(table: string) {
    const cols = columnsOf(schema, table).map((column) => ({ table, column }));
    const others = query.columns.filter((c) => c.table !== table);
    setQuery({ ...query, columns: [...others, ...cols] });
  }

  return (
    <div className="qb">
      <div className="qb-left">
        <SchemaImport
          onImport={replaceSchema}
          onLoadSample={() => replaceSchema(sampleSchema)}
        />
        <SchemaPanel schema={schema} placed={query.tables} onAdd={addTable} />
      </div>

      <div className="qb-main">
        <div className="qb-canvas">
          {query.tables.length === 0 ? (
            <div className="empty">
              <p>Add a table from the schema panel to start building.</p>
            </div>
          ) : (
            query.tables.map((t, i) => (
              <div key={t} className="qb-card-wrap">
                <TableCard
                  schema={schema}
                  table={t}
                  isFrom={i === 0}
                  selected={query.columns}
                  onToggleColumn={toggleColumn}
                  onRemove={removeTable}
                />
                <button className="qb-mini qb-all" onClick={() => selectAll(t)}>
                  select all
                </button>
              </div>
            ))
          )}
        </div>

        <ConditionsEditor schema={schema} query={query} setQuery={setQuery} />
      </div>

      <div className="qb-side">
        <button
          className="qb-mini qb-reset"
          onClick={() => setQuery(emptyQuery)}
        >
          reset query
        </button>
        <SqlPreview sql={sql} />
        <LintPanel lints={lints} />
      </div>
    </div>
  );
}
