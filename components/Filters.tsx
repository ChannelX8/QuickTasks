
import React from 'react';
import { Filter } from '../types';

interface FiltersProps {
  currentFilter: Filter;
  onFilterChange: (filter: Filter) => void;
}

const filterOptions: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const Filters: React.FC<FiltersProps> = ({ currentFilter, onFilterChange }) => {
  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {filterOptions.map(({ value, label }) => {
        const isActive = currentFilter === value;
        return (
          <button
            key={value}
            onClick={() => onFilterChange(value)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800
              ${isActive
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'
              }`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default Filters;
