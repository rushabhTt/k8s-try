// src/components/AddTodoColumnForm.tsx
import React from "react";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnId } from "./types";

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
