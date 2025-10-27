
import React from 'react';
import { Filter } from '../types';

interface EmptyStateProps {
  filter: Filter;
  searchQuery: string;
  totalTaskCount: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({ filter, searchQuery, totalTaskCount }) => {
  let title: string;
  let message: string;

  if (totalTaskCount === 0) {
    title = 'No tasks yet';
    message = 'Get started by adding a new task above.';
  } else if (searchQuery) {
    title = 'No tasks found';
    message = `Your search for "${searchQuery}" did not match any tasks. Try another term.`;
  } else {
    switch (filter) {
      case 'active':
        title = 'No active tasks';
        message = 'Great job! Check your "Completed" list or add a new task.';
        break;
      case 'completed':
        title = 'No completed tasks';
        message = 'Time to get to work and check some items off your list!';
        break;
      case 'all':
      default:
        // This case is unlikely if totalTaskCount > 0 and no search, but included for robustness.
        title = 'No tasks to show';
        message = 'Try adjusting your filters or add a new task.';
        break;
    }
  }

  return (
    <div className="text-center p-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
};

export default EmptyState;
