import type { Schema } from './types';

let counter = 0;
export function uid(): string {
  counter += 1;
  return `id-${counter}-${Math.random().toString(36).slice(2, 7)}`;
}

export function columnsOf(schema: Schema, table: string): string[] {
  return schema.find((t) => t.name === table)?.columns.map((c) => c.name) ?? [];
}
