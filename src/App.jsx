// file: src/App.jsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { sortBySpec } from './utils/sorters';
import { uid } from './utils/uid';
import TaskForm from './components/TaskForm';
import Filters from './components/Filters';
import SearchBar from './components/SearchBar';
import TaskList from './components/TaskList';
import EmptyState from './components/EmptyState';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.5rem', width: '1.5rem' }}>
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ height: '1.5rem', width: '1.5rem' }}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const App = () => {
  const [tasks, setTasks] = useLocalStorage('todo_app_v1', []);
  const [theme, setTheme] = useLocalStorage('quicktasks_theme', 'light');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [announcement, setAnnouncement] = useState('');

  const announce = (message) => {
    setAnnouncement(message);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  const handleAddTask = (newTaskData) => {
    const task = {
      ...newTaskData,
      id: uid(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [...prevTasks, task]);
    announce(`Task "${task.text}" added.`);
  };

  const handleUpdateTask = (updatedTaskData) => {
    if (!editingId) return;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingId ? { ...task, ...updatedTaskData } : task
      )
    );
    setEditingId(null);
    announce(`Task "${updatedTaskData.text}" saved.`);
  };

  const handleToggleTask = (id) => {
    let toggledTask;
    setTasks(prevTasks =>
      prevTasks.map(task => {
        if (task.id === id) {
          toggledTask = { ...task, completed: !task.completed };
          return toggledTask;
        }
        return task;
      })
    );
    if(toggledTask) {
        announce(`Marked "${toggledTask.text}" as ${toggledTask.completed ? 'complete' : 'incomplete'}.`);
    }
  };

  const handleDeleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      announce('Task deleted.');
    }
  };

  const handleClearCompleted = () => {
    if (window.confirm('Are you sure you want to clear all completed tasks?')) {
      setTasks(prevTasks => prevTasks.filter(task => !task.completed));
      announce('Cleared all completed tasks.');
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter(task =>
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tasks, filter, searchQuery]);

  const sortedTasks = useMemo(() => {
    return sortBySpec([...filteredTasks]);
  }, [filteredTasks]);

  const taskToEdit = useMemo(() => {
    return tasks.find(task => task.id === editingId) || null;
  }, [tasks, editingId]);
  
  const completedCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);

  return (
    <div className="container">
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>
      <header className="header">
        <h1>
          QuickTasks <span className="subtitle">— Your tiny productivity friend ⚡</span>
        </h1>
        <button
          onClick={toggleTheme}
          className="btn-ghost"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </header>

      <main>
        <div className="card">
            <div className="card-body">
                <TaskForm 
                onSubmit={editingId ? handleUpdateTask : handleAddTask}
                taskToEdit={taskToEdit}
                onCancelEdit={() => setEditingId(null)}
                />
            </div>
        </div>

        <div className="card">
          <div className="card-header">
            <Filters currentFilter={filter} onFilterChange={setFilter} />
            <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
          </div>
          {sortedTasks.length > 0 ? (
            <TaskList
              tasks={sortedTasks}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              onEdit={setEditingId}
            />
          ) : (
            <EmptyState />
          )}
        </div>

        {completedCount > 0 && (
          <div className="text-center">
            <button
              onClick={handleClearCompleted}
              className="clear-btn"
              aria-label="Clear all completed tasks"
            >
              Clear completed tasks
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
