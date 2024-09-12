declare module '@atlaskit/pragmatic-drag-and-drop' {
    export interface DroppableProvided {
      innerRef: React.Ref<any>
      droppableProps: any
      placeholder?: React.ReactNode
    }
  
    export interface DraggableProvided {
      innerRef: React.Ref<any>
      draggableProps: any
      dragHandleProps: any
    }
  
    export interface DropResult {
      source: { droppableId: string; index: number }
      destination?: { droppableId: string; index: number }
    }
  
    export const Droppable: React.FC<any>
    export const Draggable: React.FC<any>
    export const DragDropContext: React.FC<{ onDragEnd: (result: DropResult) => void }>
  }
  