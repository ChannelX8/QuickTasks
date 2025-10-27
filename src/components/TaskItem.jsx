// file: src/components/TaskItem.jsx
import React from 'react';
import PriorityBadge from './PriorityBadge';

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1rem', height: '1rem' }}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
);


const TaskItem = ({ task, onToggle, onDelete, onEdit }) => {
  const handleCheckboxChange = () => {
    onToggle(task.id);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onToggle(task.id);
    }
  };

  const formattedDueDate = task.due ? new Date(task.due).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }) : null;
  const formattedAddedDate = new Date(task.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short'});

  return (
    <li className="task-item">
      <div className="task-checkbox">
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={task.completed}
          onChange={handleCheckboxChange}
          onKeyDown={handleKeyDown}
          style={{ height: '1.25rem', width: '1.25rem', cursor: 'pointer' }}
          aria-labelledby={`task-text-${task.id}`}
        />
      </div>
      <div className="task-content">
        <span 
          id={`task-text-${task.id}`}
          className={`task-title ${task.completed ? 'done' : ''}`}
        >
          {task.text}
        </span>
        <div className="task-meta">
          <PriorityBadge priority={task.priority} />
          {formattedDueDate && (
            <span>Due: {formattedDueDate}</span>
          )}
          <span>Added: {formattedAddedDate}</span>
        </div>
      </div>
      <div className="task-actions">
        <button
          onClick={() => onEdit(task.id)}
          className="btn-ghost"
          aria-label={`Edit task: ${task.text}`}
        >
          <EditIcon />
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="btn-ghost"
          aria-label={`Delete task: ${task.text}`}
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
};

export default TaskItem;
