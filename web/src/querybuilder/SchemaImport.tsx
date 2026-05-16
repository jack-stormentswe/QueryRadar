import { useState } from 'react';
import { parseDdl } from './parseDdl';
import type { Schema } from './types';

export function SchemaImport({
  onImport,
  onLoadSample,
}: {
  onImport: (schema: Schema) => void;
  onLoadSample: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [ddl, setDdl] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  function doImport() {
    const { schema, errors: errs } = parseDdl(ddl);
    setErrors(errs);
    if (schema.length > 0) {
      onImport(schema);
      setOpen(false);
      setDdl('');
    }
  }

  return (
    <div className="qb-import">
      <div className="qb-sec-head">
        <h3>Schema source</h3>
        <div className="qb-import-actions">
          <button className="qb-mini" onClick={onLoadSample}>
            sample
          </button>
          <button className="qb-mini" onClick={() => setOpen((o) => !o)}>
            {open ? 'cancel' : 'import DDL'}
          </button>
        </div>
      </div>

      {open && (
        <div className="qb-import-body">
          <textarea
            className="qb-ddl"
            value={ddl}
            spellCheck={false}
            placeholder={'CREATE TABLE users (\n  id INT,\n  email VARCHAR(255)\n);'}
            onChange={(e) => setDdl(e.target.value)}
          />
          {errors.length > 0 && (
            <ul className="qb-import-errs">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
          <button className="qb-mini" onClick={doImport}>
            parse &amp; load
          </button>
        </div>
      )}
    </div>
  );
}
