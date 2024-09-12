import React from "react";
import { Draggable } from "@atlaskit/pragmatic-drag-and-drop";
import { DraggableProvided } from "@atlaskit/pragmatic-drag-and-drop";

interface TodoItemProps {
  index: number;
  content: string;
}

export default function TodoItem({ index, content }: TodoItemProps) {
  return (
    <Draggable draggableId={content} index={index}>
      {(provided: DraggableProvided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="p-2 border rounded bg-white shadow"
        >
          {content}
        </div>
      )}
    </Draggable>
  );
}
