
import React, { useState, useRef } from 'react';
import { Task } from '../types';
import PriorityBadge from './PriorityBadge';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
}

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);

const GripVerticalIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
);


const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onEdit, onReorder }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const itemRef = useRef<HTMLLIElement>(null);

  const handleCheckboxChange = () => {
    onToggle(task.id);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onToggle(task.id);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
        if (itemRef.current) {
            itemRef.current.classList.add('opacity-50');
        }
    }, 0);
  };

  const handleDragEnd = () => {
    if (itemRef.current) {
        itemRef.current.classList.remove('opacity-50');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== task.id) {
        onReorder(draggedId, task.id);
    }
  };


  const formattedDueDate = task.due ? new Date(task.due).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : null;
  const formattedAddedDate = new Date(task.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short'});

  return (
    <li 
      ref={itemRef}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 ease-in-out ${isDraggingOver ? 'border-t-2 border-indigo-500' : ''}`}
      aria-label={`Task: ${task.text}`}
    >
      <div className="flex-shrink-0 pt-1 cursor-move text-gray-400 dark:text-gray-500 touch-none" aria-label={`Drag to reorder task`}>
        <GripVerticalIcon />
      </div>
      <div className="flex-shrink-0 pt-1">
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={task.completed}
          onChange={handleCheckboxChange}
          onKeyDown={handleKeyDown}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          aria-labelledby={`task-text-${task.id}`}
        />
      </div>
      <div className="flex-grow">
        <span 
          id={`task-text-${task.id}`}
          className={`text-gray-800 dark:text-gray-100 ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}
        >
          {task.text}
        </span>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <PriorityBadge priority={task.priority} />
          {formattedDueDate && (
            <span>Due: {formattedDueDate}</span>
          )}
          <span>Added: {formattedAddedDate}</span>
        </div>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          onClick={() => onEdit(task.id)}
          className="p-2 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label={`Edit task: ${task.text}`}
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label={`Delete task: ${task.text}`}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
