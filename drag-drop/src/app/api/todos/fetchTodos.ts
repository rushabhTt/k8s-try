import { Todo, Columns } from "../../../components/types";

const fetchTodos = async (initialColumns: Columns): Promise<Columns> => {
  try {
    const response = await fetch("/api/todos");
    const todos = await response.json();

    const updatedColumns: Columns = { ...initialColumns };
    todos.forEach((todo: Todo) => {
      if (updatedColumns[todo.columnId]) {
        updatedColumns[todo.columnId].items.push(todo);
      }
    });

    return updatedColumns;
  } catch (err) {
    console.error("Error fetching todos:", err);
    throw err;
  }
};

export { fetchTodos };