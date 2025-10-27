
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Task, Filter } from './types';
import { uid } from './utils/uid';
import TaskForm from './components/TaskForm';
import Filters from './components/Filters';
import SearchBar from './components/SearchBar';
import TaskList from './components/TaskList';
import EmptyState from './components/EmptyState';

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo_app_v1', []);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('quicktasks_theme', 'light');
  const [filter, setFilter] = useState<Filter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    const task: Task = {
      ...newTaskData,
      id: uid(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prevTasks => [...prevTasks, task]);
  };

  const handleUpdateTask = (updatedTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingId) return;
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === editingId ? { ...task, ...updatedTaskData } : task
      )
    );
    setEditingId(null);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }
  };

  const handleClearCompleted = () => {
    if (window.confirm('Are you sure you want to clear all completed tasks?')) {
      setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    }
  };

  const handleReorderTasks = useCallback((draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;

    setTasks(prevTasks => {
        const draggedIndex = prevTasks.findIndex(t => t.id === draggedId);
        const targetIndex = prevTasks.findIndex(t => t.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) {
            return prevTasks;
        }

        const newTasks = [...prevTasks];
        const [draggedTask] = newTasks.splice(draggedIndex, 1);
        newTasks.splice(targetIndex, 0, draggedTask);

        return newTasks;
    });
  }, [setTasks]);

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

  const taskToEdit = useMemo(() => {
    return tasks.find(task => task.id === editingId) || null;
  }, [tasks, editingId]);
  
  const completedCount = useMemo(() => tasks.filter(task => task.completed).length, [tasks]);

  return (
    <div className="min-h-screen font-sans">
      <div className="container mx-auto max-w-2xl p-4 sm:p-6 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            QuickTasks <span className="text-lg sm:text-xl font-normal text-gray-500 dark:text-gray-400 hidden sm:inline">— Your tiny productivity friend ⚡</span>
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-950 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </header>

        <main>
          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg p-4 sm:p-6 mb-6">
            <TaskForm 
              onSubmit={editingId ? handleUpdateTask : handleAddTask}
              taskToEdit={taskToEdit}
              onCancelEdit={() => setEditingId(null)}
            />
          </div>

          <div className="bg-white dark:bg-gray-900 shadow-md rounded-lg mb-6">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Filters currentFilter={filter} onFilterChange={setFilter} />
              <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
            </div>
            {filteredTasks.length > 0 ? (
              <TaskList
                tasks={filteredTasks}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
                onEdit={setEditingId}
                onReorder={handleReorderTasks}
              />
            ) : (
              <EmptyState 
                filter={filter}
                searchQuery={searchQuery}
                totalTaskCount={tasks.length}
              />
            )}
          </div>

          {completedCount > 0 && (
            <div className="text-center">
              <button
                onClick={handleClearCompleted}
                className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
                aria-label="Clear all completed tasks"
              >
                Clear completed tasks
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
