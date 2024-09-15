// src/components/TodoColumn.tsx
import React from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AddTodoColumnForm } from "./AddTodoColumnForm";
import { TodoItem } from "./TodoItem";
import { ColumnId, Todo, EditingTodo } from "./types";

interface TodoColumnProps {
  columnId: ColumnId;
  column: { title: string; items: Todo[] };
  newTodoValue: string;
  onNewTodoChange: (value: string) => void;
  onAddTodo: (e: React.FormEvent<HTMLFormElement>) => void;
  editingTodo: EditingTodo | null;
  startEditing: (todo: Todo) => void;
  setEditingTodo: (todo: EditingTodo | null) => void;
  saveEdit: () => void;
  removeTodoItem: (index: number) => void;
}

export const TodoColumn: React.FC<TodoColumnProps> = ({
  columnId,
  column,
  newTodoValue,
  onNewTodoChange,
  onAddTodo,
  editingTodo,
  startEditing,
  setEditingTodo,
  saveEdit,
  removeTodoItem,
}) => (
  <div className="flex-1">
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{column.title}</h2>
      </CardHeader>
      <CardContent>
        <AddTodoColumnForm
          columnId={columnId}
          value={newTodoValue}
          onChange={onNewTodoChange}
          onSubmit={onAddTodo}
        />
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
                      <TodoItem
                        item={item}
                        editingTodo={editingTodo}
                        startEditing={startEditing}
                        setEditingTodo={setEditingTodo}
                        saveEdit={saveEdit}
                        removeTodoItem={() => removeTodoItem(index)}
                      />
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
);
