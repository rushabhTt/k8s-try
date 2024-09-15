// src/components/AddTodoForm.tsx
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnId } from "./types";

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
