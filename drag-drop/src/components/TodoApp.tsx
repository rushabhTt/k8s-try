"use client";

import React, { useState } from "react";
import type { NextPage } from "next";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { PlusCircle, X } from "lucide-react";
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

interface Todo {
  id: string;
  content: string;
}

interface Column {
  title: string;
  items: Todo[];
}

type ColumnId = "todo" | "inProgress" | "done";

interface Columns {
  [key: string]: Column;
}

const initialColumns: Columns = {
  todo: { title: "To Do", items: [] },
  inProgress: { title: "In Progress", items: [] },
  done: { title: "Done", items: [] },
};

const TodoApp: NextPage = () => {
  const [columns, setColumns] = useState<Columns>(initialColumns);
  const [newTodo, setNewTodo] = useState<string>("");
  const [selectedColumn, setSelectedColumn] = useState<ColumnId>("todo");
  const [newTodos, setNewTodos] = useState<{ [key in ColumnId]: string }>({
    todo: "",
    inProgress: "",
    done: "",
  });

  const addTodoCommon = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    setColumns((prevColumns) => ({
      ...prevColumns,
      [selectedColumn]: {
        ...prevColumns[selectedColumn],
        items: [
          ...prevColumns[selectedColumn].items,
          { id: Date.now().toString(), content: newTodo },
        ],
      },
    }));
    setNewTodo("");
  };

  const addTodoColumn = (
    columnId: ColumnId,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!newTodos[columnId].trim()) return;

    setColumns((prevColumns) => ({
      ...prevColumns,
      [columnId]: {
        ...prevColumns[columnId],
        items: [
          ...prevColumns[columnId].items,
          { id: Date.now().toString(), content: newTodos[columnId] },
        ],
      },
    }));
    setNewTodos((prev) => ({ ...prev, [columnId]: "" }));
  };

  const onDragEnd = (result: DropResult) => {
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

  const removeTodo = (columnId: ColumnId, index: number) => {
    setColumns((prevColumns) => ({
      ...prevColumns,
      [columnId]: {
        ...prevColumns[columnId],
        items: prevColumns[columnId].items.filter((_, i) => i !== index),
      },
    }));
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
                            key={item.id}
                            draggableId={item.id}
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
                                {item.content}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    removeTodo(columnId as ColumnId, index)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
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
};

export default TodoApp;