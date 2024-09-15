// src/components/TodoComponents.tsx

import { PlusCircle, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ColumnId, Todo, EditingTodo } from "./types";

interface AddTodoFormProps {
  newTodo: string;
  setNewTodo: (value: string) => void;
  selectedColumn: ColumnId;
  setSelectedColumn: (value: ColumnId) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  columns: Record<string, { title: string }>;
}

export const AddTodoForm: React.FC<AddTodoFormProps> = ({
  newTodo,
  setNewTodo,
  selectedColumn,
  setSelectedColumn,
  onSubmit,
  columns,
}) => (
  <form onSubmit={onSubmit} className="mb-4 flex gap-2">
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
);

interface AddTodoColumnFormProps {
  columnId: ColumnId;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const AddTodoColumnForm: React.FC<AddTodoColumnFormProps> = ({
  columnId,
  value,
  onChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="mb-4 flex gap-2">
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Add to ${columnId}`}
      className="flex-grow"
    />
    <Button type="submit">
      <PlusCircle className="h-4 w-4" />
    </Button>
  </form>
);

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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
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
