"use client";

import React, { useState } from "react";
import Column from "./Column";
import { DragDropContext, DropResult } from "@atlaskit/pragmatic-drag-and-drop";

const labels = ["To Do", "In Progress", "Done"];
const initialTodos = {
  todo: ["Task 1", "Task 2"],
  inProgress: ["Task 3"],
  done: [] as string[],
};

export default function Board() {
  const [todos, setTodos] = useState(initialTodos);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    const sourceCol = source.droppableId as keyof typeof todos;
    const destinationCol = destination.droppableId as keyof typeof todos;
    const [movedTask] = todos[sourceCol].splice(source.index, 1);
    todos[destinationCol].splice(destination.index, 0, movedTask);
    setTodos({ ...todos });
  };

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd} />
      <div className="grid grid-cols-3 gap-4">
        {labels.map((label, index) => (
          <Column
            key={index}
            label={label}
            todos={todos[label.toLowerCase() as keyof typeof todos]}
          />
        ))}
      </div>
    </>
  );
}
