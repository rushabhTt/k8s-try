interface Todo {
  _id: string;
  content: string;
  columnId: ColumnId;
}

interface Column {
  title: string;
  items: Todo[];
}

type ColumnId = "todo" | "inProgress" | "done";

interface Columns {
  [key: string]: Column;
}

interface EditingTodo {
  id: string;
  content: string;
}

export type { Todo, ColumnId, Columns, EditingTodo };
