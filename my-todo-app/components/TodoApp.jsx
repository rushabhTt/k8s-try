"use client";
import React, { useState, useCallback, useRef } from 'react';
import { PlusCircle, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DragDropContext, draggable, droppable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop';
// import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/adapter/element';

const initialColumns = {
  todo: { title: 'To Do', items: [] },
  inProgress: { title: 'In Progress', items: [] },
  done: { title: 'Done', items: [] },
};

const Task = ({ id, content, index, columnId, removeTask }) => {
  const ref = useRef(null);

  draggable({
    element: ref,
    dragHandle: ref,
    data: { id, index, columnId, type: 'task' },
  });

  return (
    <li
      ref={ref}
      className="bg-white p-2 rounded shadow flex justify-between items-center cursor-move"
    >
      <div className="flex items-center">
        <GripVertical className="mr-2 h-4 w-4" />
        {content}
      </div>
      <Button variant="ghost" size="sm" onClick={() => removeTask(columnId, index)}>
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
};

const Column = ({ columnId, column, removeTask, addTask }) => {
  const [newTask, setNewTask] = useState('');
  const ref = useRef(null);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(columnId, newTask);
      setNewTask('');
    }
  };

  droppable({
    element: ref,
    onDragStart: (event) => {
      event.source.element.classList.add('opacity-50');
    },
    onDragEnd: (event) => {
      event.source.element.classList.remove('opacity-50');
    },
  });

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">{column.title}</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddTask} className="mb-4 flex gap-2">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder={`Add to ${column.title}`}
            className="flex-grow"
          />
          <Button type="submit">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </form>
        <ul ref={ref} className="space-y-2 min-h-[200px]">
          {column.items.map((task, index) => (
            <Task
              key={task.id}
              id={task.id}
              content={task.content}
              index={index}
              columnId={columnId}
              removeTask={removeTask}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

const TodoApp = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [newTodo, setNewTodo] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('todo');

  const addTodoCommon = (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    const updatedColumns = {
      ...columns,
      [selectedColumn]: {
        ...columns[selectedColumn],
        items: [...columns[selectedColumn].items, { id: Date.now().toString(), content: newTodo }],
      },
    };
    setColumns(updatedColumns);
    setNewTodo('');
  };

  const addTask = (columnId, content) => {
    const updatedColumns = {
      ...columns,
      [columnId]: {
        ...columns[columnId],
        items: [...columns[columnId].items, { id: Date.now().toString(), content }],
      },
    };
    setColumns(updatedColumns);
  };

  const removeTask = (columnId, index) => {
    setColumns((prevColumns) => {
      const updatedColumns = { ...prevColumns };
      updatedColumns[columnId].items.splice(index, 1);
      return updatedColumns;
    });
  };

  const onDragEnd = useCallback((source, destination) => {
    if (!destination) return;

    setColumns((prevColumns) => {
      const updatedColumns = { ...prevColumns };
      const [movedTask] = updatedColumns[source.columnId].items.splice(source.index, 1);
      updatedColumns[destination.columnId].items.splice(destination.index, 0, movedTask);
      return updatedColumns;
    });
  }, []);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
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
        <div className="flex gap-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="flex-1">
              <Column
                columnId={columnId}
                column={column}
                removeTask={removeTask}
                addTask={addTask}
              />
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default TodoApp;