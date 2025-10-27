// file: src/components/Filters.jsx
import React from 'react';

const filterOptions = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const Filters = ({ currentFilter, onFilterChange }) => {
  return (
    <div role="tablist" aria-label="Task filters">
      {filterOptions.map(({ value, label }) => {
        const isActive = currentFilter === value;
        return (
          <button
            key={value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onFilterChange(value)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default Filters;
