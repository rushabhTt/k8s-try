"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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

const initialColumns = {
  todo: { title: "To Do", items: [] },
  inProgress: { title: "In Progress", items: [] },
  done: { title: "Done", items: [] },
};

const TodoApp = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [newTodo, setNewTodo] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [newTodos, setNewTodos] = useState({
    todo: "",
    inProgress: "",
    done: "",
  });

  const addTodoCommon = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const updatedColumns = {
      ...columns,
      [selectedColumn]: {
        ...columns[selectedColumn],
        items: [
          ...columns[selectedColumn].items,
          { id: Date.now().toString(), content: newTodo },
        ],
      },
    };
    setColumns(updatedColumns);
    setNewTodo("");
  };

  const addTodoColumn = (columnId, e) => {
    e.preventDefault();
    if (!newTodos[columnId].trim()) return;

    const updatedColumns = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: [
          ...columns[columnId].items,
          { id: Date.now().toString(), content: newTodos[columnId] },
        ],
      },
    };
    setColumns(updatedColumns);
    setNewTodos({ ...newTodos, [columnId]: "" });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceColumn,
          items: sourceItems,
        },
        [destination.droppableId]: {
          ...destColumn,
          items: destItems,
        },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...column,
          items: copiedItems,
        },
      });
    }
  };

  const removeTodo = (columnId, index) => {
    const updatedColumns = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: columns[columnId].items.filter((_, i) => i !== index),
      },
    };
    setColumns(updatedColumns);
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
        <Select value={selectedColumn} onValueChange={setSelectedColumn}>
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
                    onSubmit={(e) => addTodoColumn(columnId, e)}
                    className="mb-4 flex gap-2"
                  >
                    <Input
                      type="text"
                      value={newTodos[columnId]}
                      onChange={(e) =>
                        setNewTodos({ ...newTodos, [columnId]: e.target.value })
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
                                  onClick={() => removeTodo(columnId, index)}
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
