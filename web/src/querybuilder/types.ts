export interface Column {
  name: string;
  type: string;
}

export interface Table {
  name: string;
  columns: Column[];
}

export type Schema = Table[];

export type JoinType = 'INNER' | 'LEFT';

export interface Join {
  id: string;
  type: JoinType;
  leftTable: string;
  leftColumn: string;
  rightTable: string;
  rightColumn: string;
}

export type FilterOp = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'LIKE' | 'IN';

export interface Filter {
  id: string;
  table: string;
  column: string;
  op: FilterOp;
  value: string;
  conjunction: 'AND' | 'OR';
}

export interface OrderBy {
  id: string;
  table: string;
  column: string;
  dir: 'ASC' | 'DESC';
}

export interface SelectedColumn {
  table: string;
  column: string;
}

export interface QueryModel {
  /** Tables placed on the canvas, in selection order. First is the FROM table. */
  tables: string[];
  columns: SelectedColumn[];
  joins: Join[];
  filters: Filter[];
  orderBy: OrderBy[];
  limit: number | null;
  distinct: boolean;
}

export const emptyQuery: QueryModel = {
  tables: [],
  columns: [],
  joins: [],
  filters: [],
  orderBy: [],
  limit: null,
  distinct: false,
};
