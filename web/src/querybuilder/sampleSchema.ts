import type { Schema } from './types';

/** A small e-commerce schema so the builder is usable without a live DB. */
export const sampleSchema: Schema = [
  {
    name: 'customers',
    columns: [
      { name: 'id', type: 'int' },
      { name: 'email', type: 'varchar' },
      { name: 'name', type: 'varchar' },
      { name: 'country', type: 'varchar' },
      { name: 'created_at', type: 'timestamp' },
    ],
  },
  {
    name: 'orders',
    columns: [
      { name: 'id', type: 'int' },
      { name: 'customer_id', type: 'int' },
      { name: 'status', type: 'varchar' },
      { name: 'total', type: 'decimal' },
      { name: 'placed_at', type: 'timestamp' },
    ],
  },
  {
    name: 'order_items',
    columns: [
      { name: 'id', type: 'int' },
      { name: 'order_id', type: 'int' },
      { name: 'product_id', type: 'int' },
      { name: 'quantity', type: 'int' },
      { name: 'unit_price', type: 'decimal' },
    ],
  },
  {
    name: 'products',
    columns: [
      { name: 'id', type: 'int' },
      { name: 'sku', type: 'varchar' },
      { name: 'name', type: 'varchar' },
      { name: 'price', type: 'decimal' },
      { name: 'category', type: 'varchar' },
    ],
  },
];
