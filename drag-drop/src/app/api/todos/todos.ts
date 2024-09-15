// src/app/api/todos/todos.ts

import { Todo, Columns, ColumnId } from "../../../components/types";

// Function to add a new todo
const addTodo = async (content: string, columnId: ColumnId): Promise<Todo> => {
  try {
    const response = await fetch("/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content, columnId }),
    });
    const result = await response.json();
    return {
      _id: result.insertedId,
      content,
      columnId,
    };
  } catch (err) {
    console.error("Error adding todo:", err);
    throw err;
  }
};

// Function to fetch todos and update columns
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

// Function to remove a todo
const removeTodo = async (id: string): Promise<void> => {
  try {
    await fetch("/api/todos", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  } catch (err) {
    console.error("Error removing todo:", err);
    throw err;
  }
};

// Function to update a todo
const updateTodo = async (
  todo: Partial<Todo> & { id: string }
): Promise<void> => {
  try {
    await fetch("/api/todos", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(todo),
    });
  } catch (err) {
    console.error("Error updating todo:", err);
    throw err;
  }
};

export { addTodo, fetchTodos, removeTodo, updateTodo };
