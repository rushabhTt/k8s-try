// src/components/TodoApp.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";

import { ColumnId, Columns, EditingTodo, Todo } from "./types";
import {
  fetchTodos,
  addTodo,
  updateTodo,
  removeTodo,
} from "../app/api/todos/todos";
import { AddTodoForm } from "./AddTodoForm";
import { TodoColumn } from "./TodoColumn";

const initialColumns: Columns = {
  todo: { title: "To Do", items: [] },
  inProgress: { title: "In Progress", items: [] },
  done: { title: "Done", items: [] },
};

export default function TodoApp() {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [newTodo, setNewTodo] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<ColumnId>("todo");
  const [newTodos, setNewTodos] = useState<{ [key in ColumnId]: string }>({
    todo: "",
    inProgress: "",
    done: "",
  });
  const [editingTodo, setEditingTodo] = useState<EditingTodo | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      fetchTodos(initialColumns).then((columns) => setColumns(columns));
      hasFetched.current = true;
    }
  }, []);

  const addTodoCommon = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const newTodoItem = await addTodo(newTodo, selectedColumn);
      setColumns((prevColumns) => ({
        ...prevColumns,
        [selectedColumn]: {
          ...prevColumns[selectedColumn],
          items: [...prevColumns[selectedColumn].items, newTodoItem],
        },
      }));
      setNewTodo("");
    } catch (err) {
      console.error("Error adding todo:", err);
    }
  };

  const addTodoColumn = async (
    columnId: ColumnId,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!newTodos[columnId].trim()) return;

    try {
      const newTodoItem = await addTodo(newTodos[columnId], columnId);
      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          items: [...prevColumns[columnId].items, newTodoItem],
        },
      }));
      setNewTodos((prev) => ({ ...prev, [columnId]: "" }));
    } catch (err) {
      console.error("Error adding todo to column:", err);
    }
  };

  const removeTodoItem = async (columnId: ColumnId, index: number) => {
    try {
      await removeTodo(columns[columnId].items[index]._id);
      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          items: prevColumns[columnId].items.filter((_, i) => i !== index),
        },
      }));
    } catch (err) {
      console.error("Error removing todo:", err);
    }
  };

  const saveEdit = async () => {
    if (!editingTodo) return;

    try {
      await updateTodo({
        id: editingTodo.id,
        content: editingTodo.content,
      });

      setColumns((prevColumns) => {
        const updatedColumns = { ...prevColumns };
        for (const columnId in updatedColumns) {
          updatedColumns[columnId].items = updatedColumns[columnId].items.map(
            (item) =>
              item._id === editingTodo.id
                ? { ...item, content: editingTodo.content }
                : item
          );
        }
        return updatedColumns;
      });

      setEditingTodo(null);
    } catch (err) {
      console.error("Error updating todo:", err);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo({ id: todo._id, content: todo.content });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      setColumns((prevColumns) => {
        const sourceColumn = prevColumns[source.droppableId];
        const destColumn = prevColumns[destination.droppableId];
        const sourceItems = [...sourceColumn.items];
        const destItems = [...destColumn.items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);

        return {
          ...prevColumns,
          [source.droppableId]: {
            ...sourceColumn,
            items: sourceItems,
          },
          [destination.droppableId]: {
            ...destColumn,
            items: destItems,
          },
        };
      });

      try {
        await updateTodo({
          id: columns[source.droppableId].items[source.index]._id,
          columnId: destination.droppableId as ColumnId,
        });
      } catch (err) {
        console.error("Error updating todo column:", err);
      }
    } else {
      setColumns((prevColumns) => {
        const column = prevColumns[source.droppableId];
        const copiedItems = [...column.items];
        const [removed] = copiedItems.splice(source.index, 1);
        copiedItems.splice(destination.index, 0, removed);

        return {
          ...prevColumns,
          [source.droppableId]: {
            ...column,
            items: copiedItems,
          },
        };
      });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Multi-Column To-Do App</h1>
      <AddTodoForm
        newTodo={newTodo}
        setNewTodo={setNewTodo}
        selectedColumn={selectedColumn}
        setSelectedColumn={setSelectedColumn}
        onSubmit={addTodoCommon}
        columns={columns}
      />
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <TodoColumn
              key={columnId}
              columnId={columnId as ColumnId}
              column={column}
              newTodoValue={newTodos[columnId as ColumnId]}
              onNewTodoChange={(value) =>
                setNewTodos((prev) => ({ ...prev, [columnId]: value }))
              }
              onAddTodo={(e) => addTodoColumn(columnId as ColumnId, e)}
              editingTodo={editingTodo}
              startEditing={startEditing}
              setEditingTodo={setEditingTodo}
              saveEdit={saveEdit}
              removeTodoItem={(index) =>
                removeTodoItem(columnId as ColumnId, index)
              }
            />
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
