"use client";

import React from "react";
import { Droppable } from "@atlaskit/pragmatic-drag-and-drop";
import { DroppableProvided } from "@atlaskit/pragmatic-drag-and-drop";
import TodoItem from "./TodoItem";

interface ColumnProps {
  label: string;
  todos: string[];
}

export default function Column({ label, todos }: ColumnProps) {
  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">{label}</h2>
      <Droppable droppableId={label.toLowerCase()}>
        {(provided: DroppableProvided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {todos.map((todo, index) => (
              <TodoItem key={index} index={index} content={todo} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
