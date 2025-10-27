// file: src/components/EmptyState.jsx
import React from 'react';

const EmptyState = () => {
  return (
    <div className="text-center" style={{ padding: '3rem' }}>
      <svg style={{ margin: '0 auto', height: '3rem', width: '3rem', color: '#a7a7ae' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 style={{ marginTop: '0.5rem', fontSize: '1.125rem', fontWeight: 500 }}>No tasks yet</h3>
      <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }} className="muted">Get started by adding a new task above.</p>
    </div>
  );
};

export default EmptyState;
