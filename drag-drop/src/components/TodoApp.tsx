"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { PlusCircle, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Todo, ColumnId, Columns, EditingTodo } from "./types";
import { fetchTodos } from "../app/api/todos/fetchTodos";

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
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newTodo, columnId: selectedColumn }),
      });
      const result = await response.json();

      setColumns((prevColumns) => ({
        ...prevColumns,
        [selectedColumn]: {
          ...prevColumns[selectedColumn],
          items: [
            ...prevColumns[selectedColumn].items,
            {
              _id: result.insertedId,
              content: newTodo,
              columnId: selectedColumn,
            },
          ],
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
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newTodos[columnId], columnId }),
      });
      const result = await response.json();

      setColumns((prevColumns) => ({
        ...prevColumns,
        [columnId]: {
          ...prevColumns[columnId],
          items: [
            ...prevColumns[columnId].items,
            { _id: result.insertedId, content: newTodos[columnId], columnId },
          ],
        },
      }));
      setNewTodos((prev) => ({ ...prev, [columnId]: "" }));
    } catch (err) {
      console.error("Error adding todo to column:", err);
    }
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
        await fetch("/api/todos", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: columns[source.droppableId].items[source.index]._id,
            columnId: destination.droppableId,
          }),
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

  const removeTodo = async (columnId: ColumnId, index: number) => {
    try {
      await fetch("/api/todos", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: columns[columnId].items[index]._id }),
      });

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

  const startEditing = (todo: Todo) => {
    setEditingTodo({ id: todo._id, content: todo.content });
  };

  const saveEdit = async () => {
    if (!editingTodo) return;

    try {
      await fetch("/api/todos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTodo.id,
          content: editingTodo.content,
        }),
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Multi-Column To-Do App</h1>
      <form onSubmit={addTodoCommon} className="mb-4 flex gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Enter a new todo"
          className="flex-grow"
        />
        <Select
          value={selectedColumn}
          onValueChange={(value: ColumnId) => setSelectedColumn(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a column" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(columns).map((columnId) => (
              <SelectItem key={columnId} value={columnId}>
                {columns[columnId].title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Todo
        </Button>
      </form>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex-1">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">{column.title}</h2>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={(e) => addTodoColumn(columnId as ColumnId, e)}
                    className="mb-4 flex gap-2"
                  >
                    <Input
                      type="text"
                      value={newTodos[columnId as ColumnId]}
                      onChange={(e) =>
                        setNewTodos((prev) => ({
                          ...prev,
                          [columnId]: e.target.value,
                        }))
                      }
                      placeholder={`Add to ${column.title}`}
                      className="flex-grow"
                    />
                    <Button type="submit">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </form>
                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <ul
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="min-h-[200px] space-y-2"
                      >
                        {column.items.map((item, index) => (
                          <Draggable
                            key={item._id.toString()}
                            draggableId={item._id.toString()}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-2 rounded shadow flex justify-between items-center ${
                                  snapshot.isDragging ? "opacity-50" : ""
                                }`}
                              >
                                {editingTodo && editingTodo.id === item._id ? (
                                  <Input
                                    type="text"
                                    value={editingTodo.content}
                                    onChange={(e) =>
                                      setEditingTodo({
                                        ...editingTodo,
                                        content: e.target.value,
                                      })
                                    }
                                    onBlur={saveEdit}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                  />
                                ) : (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <span className="cursor-pointer">
                                        {truncateText(item.content, 30)}
                                      </span>
                                    </DialogTrigger>
                                    <DialogContent className="bg-white border-0 shadow-lg">
                                      <DialogHeader>
                                        <DialogTitle>Todo Details</DialogTitle>
                                      </DialogHeader>
                                      <p>{item.content}</p>
                                    </DialogContent>
                                  </Dialog>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => startEditing(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeTodo(columnId as ColumnId, index)
                                    }
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}