// src/components/TodoItem.tsx
import React from "react";
import { X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Todo, EditingTodo } from "./types";
import { truncateText } from "../utils/textUtils";

interface TodoItemProps {
  item: Todo;
  editingTodo: EditingTodo | null;
  startEditing: (todo: Todo) => void;
  setEditingTodo: (todo: EditingTodo | null) => void;
  saveEdit: () => void;
  removeTodoItem: () => void;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  item,
  editingTodo,
  startEditing,
  setEditingTodo,
  saveEdit,
  removeTodoItem,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveEdit();
    }
  };

  return (
    <>
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
        <Button variant="ghost" size="sm" onClick={() => startEditing(item)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={removeTodoItem}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};
