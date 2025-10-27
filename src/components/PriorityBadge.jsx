// file: src/components/PriorityBadge.jsx
import React from 'react';

const priorityLabels = {
  high: 'High',
  normal: 'Normal',
  low: 'Low',
};

const PriorityBadge = ({ priority }) => {
  const label = priorityLabels[priority] || 'Normal';

  return (
    <span className="chip" data-level={priority}>
      {label}
    </span>
  );
};

export default PriorityBadge;
