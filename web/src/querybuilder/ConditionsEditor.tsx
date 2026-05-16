import type {
  Filter,
  FilterOp,
  Join,
  JoinType,
  OrderBy,
  QueryModel,
  Schema,
} from './types';
import { columnsOf, uid } from './utils';

const OPS: FilterOp[] = ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'IN'];

export function ConditionsEditor({
  schema,
  query,
  setQuery,
}: {
  schema: Schema;
  query: QueryModel;
  setQuery: (q: QueryModel) => void;
}) {
  const tables = query.tables;
  const patch = (p: Partial<QueryModel>) => setQuery({ ...query, ...p });

  function addJoin() {
    if (tables.length < 2) return;
    const j: Join = {
      id: uid(),
      type: 'INNER',
      leftTable: tables[0],
      leftColumn: columnsOf(schema, tables[0])[0] ?? '',
      rightTable: tables[1],
      rightColumn: columnsOf(schema, tables[1])[0] ?? '',
    };
    patch({ joins: [...query.joins, j] });
  }

  function addFilter() {
    if (tables.length === 0) return;
    const f: Filter = {
      id: uid(),
      table: tables[0],
      column: columnsOf(schema, tables[0])[0] ?? '',
      op: '=',
      value: '',
      conjunction: 'AND',
    };
    patch({ filters: [...query.filters, f] });
  }

  function addOrder() {
    if (tables.length === 0) return;
    const o: OrderBy = {
      id: uid(),
      table: tables[0],
      column: columnsOf(schema, tables[0])[0] ?? '',
      dir: 'ASC',
    };
    patch({ orderBy: [...query.orderBy, o] });
  }

  const upJoin = (id: string, p: Partial<Join>) =>
    patch({ joins: query.joins.map((j) => (j.id === id ? { ...j, ...p } : j)) });
  const upFilter = (id: string, p: Partial<Filter>) =>
    patch({ filters: query.filters.map((f) => (f.id === id ? { ...f, ...p } : f)) });
  const upOrder = (id: string, p: Partial<OrderBy>) =>
    patch({ orderBy: query.orderBy.map((o) => (o.id === id ? { ...o, ...p } : o)) });

  return (
    <div className="qb-conditions">
      <section>
        <div className="qb-sec-head">
          <h3>Joins</h3>
          <button className="qb-mini" onClick={addJoin} disabled={tables.length < 2}>
            + join
          </button>
        </div>
        {query.joins.map((j) => (
          <div key={j.id} className="qb-row">
            <select
              value={j.type}
              onChange={(e) => upJoin(j.id, { type: e.target.value as JoinType })}
            >
              <option>INNER</option>
              <option>LEFT</option>
            </select>
            <TC schema={schema} tables={tables} t={j.leftTable} c={j.leftColumn}
               onT={(t) => upJoin(j.id, { leftTable: t, leftColumn: columnsOf(schema, t)[0] ?? '' })}
               onC={(c) => upJoin(j.id, { leftColumn: c })} />
            <span className="qb-eq">=</span>
            <TC schema={schema} tables={tables} t={j.rightTable} c={j.rightColumn}
               onT={(t) => upJoin(j.id, { rightTable: t, rightColumn: columnsOf(schema, t)[0] ?? '' })}
               onC={(c) => upJoin(j.id, { rightColumn: c })} />
            <button className="qb-x" onClick={() => patch({ joins: query.joins.filter((x) => x.id !== j.id) })}>×</button>
          </div>
        ))}
      </section>

      <section>
        <div className="qb-sec-head">
          <h3>Filters</h3>
          <button className="qb-mini" onClick={addFilter} disabled={tables.length === 0}>
            + filter
          </button>
        </div>
        {query.filters.map((f, i) => (
          <div key={f.id} className="qb-row">
            {i > 0 ? (
              <select
                value={f.conjunction}
                onChange={(e) => upFilter(f.id, { conjunction: e.target.value as 'AND' | 'OR' })}
              >
                <option>AND</option>
                <option>OR</option>
              </select>
            ) : (
              <span className="qb-kw">WHERE</span>
            )}
            <TC schema={schema} tables={tables} t={f.table} c={f.column}
               onT={(t) => upFilter(f.id, { table: t, column: columnsOf(schema, t)[0] ?? '' })}
               onC={(c) => upFilter(f.id, { column: c })} />
            <select value={f.op} onChange={(e) => upFilter(f.id, { op: e.target.value as FilterOp })}>
              {OPS.map((o) => <option key={o}>{o}</option>)}
            </select>
            <input
              className="qb-val"
              value={f.value}
              placeholder="value"
              onChange={(e) => upFilter(f.id, { value: e.target.value })}
            />
            <button className="qb-x" onClick={() => patch({ filters: query.filters.filter((x) => x.id !== f.id) })}>×</button>
          </div>
        ))}
      </section>

      <section>
        <div className="qb-sec-head">
          <h3>Sort &amp; limit</h3>
          <button className="qb-mini" onClick={addOrder} disabled={tables.length === 0}>
            + order by
          </button>
        </div>
        {query.orderBy.map((o) => (
          <div key={o.id} className="qb-row">
            <TC schema={schema} tables={tables} t={o.table} c={o.column}
               onT={(t) => upOrder(o.id, { table: t, column: columnsOf(schema, t)[0] ?? '' })}
               onC={(c) => upOrder(o.id, { column: c })} />
            <select value={o.dir} onChange={(e) => upOrder(o.id, { dir: e.target.value as 'ASC' | 'DESC' })}>
              <option>ASC</option>
              <option>DESC</option>
            </select>
            <button className="qb-x" onClick={() => patch({ orderBy: query.orderBy.filter((x) => x.id !== o.id) })}>×</button>
          </div>
        ))}
        <div className="qb-row">
          <label className="qb-inline">
            <input
              type="checkbox"
              checked={query.distinct}
              onChange={(e) => patch({ distinct: e.target.checked })}
            />
            DISTINCT
          </label>
          <label className="qb-inline">
            LIMIT
            <input
              className="qb-val"
              type="number"
              min={0}
              value={query.limit ?? ''}
              onChange={(e) =>
                patch({ limit: e.target.value === '' ? null : Number(e.target.value) })
              }
            />
          </label>
        </div>
      </section>
    </div>
  );
}

function TC({
  schema,
  tables,
  t,
  c,
  onT,
  onC,
}: {
  schema: Schema;
  tables: string[];
  t: string;
  c: string;
  onT: (table: string) => void;
  onC: (col: string) => void;
}) {
  return (
    <>
      <select value={t} onChange={(e) => onT(e.target.value)}>
        {tables.map((x) => <option key={x}>{x}</option>)}
      </select>
      <select value={c} onChange={(e) => onC(e.target.value)}>
        {columnsOf(schema, t).map((x) => <option key={x}>{x}</option>)}
      </select>
    </>
  );
}
