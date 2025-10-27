
import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority;
}

const priorityStyles: Record<Priority, { label: string; className: string }> = {
  high: {
    label: 'High',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  },
  normal: {
    label: 'Normal',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  },
  low: {
    label: 'Low',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  },
};

const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const { label, className } = priorityStyles[priority];

  return (
    <span className={`px-2 py-0.5 inline-flex text-xs leading-4 font-semibold rounded-full ${className}`}>
      {label}
    </span>
  );
};

export default PriorityBadge;
