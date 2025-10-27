// file: src/components/SearchBar.jsx
import React from 'react';

const SearchBar = ({ query, onQueryChange }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '16rem' }}>
       <label htmlFor="search-tasks" className="sr-only">Search tasks</label>
       <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '0.75rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <svg style={{ height: '1.25rem', width: '1.25rem', color: '#a7a7ae' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        </div>
        <input
          id="search-tasks"
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search tasks..."
          className="input"
          style={{ paddingLeft: '2.5rem' }}
        />
    </div>
  );
};

export default SearchBar;
