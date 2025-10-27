// file: src/ai_studio_skin.js
export function installSkin() {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji';
      
      /* Light Theme */
      --bg-primary: #f7f7f8;
      --bg-secondary: #ffffff;
      --text-primary: #18181b;
      --text-secondary: #5f5f67;
      --border-color: #e0e0e2;
      --brand-color: #4f46e5;
      --brand-color-hover: #4338ca;
      --btn-text-color: #ffffff;
      --focus-ring-color: #6366f1;
      --danger-color: #ef4444;
      --danger-color-hover: #dc2626;
      --recording-color: #ef4444;

      --chip-high-bg: #fee2e2;
      --chip-high-text: #b91c1c;
      --chip-normal-bg: #fef3c7;
      --chip-normal-text: #b45309;
      --chip-low-bg: #dcfce7;
      --chip-low-text: #166534;
    }

    html.dark {
      /* Dark Theme */
      --bg-primary: #18181b;
      --bg-secondary: #27272a;
      --text-primary: #f7f7f8;
      --text-secondary: #a7a7ae;
      --border-color: #4e4e56;
      --focus-ring-color: #818cf8;
      --danger-color: #f87171;
      --danger-color-hover: #ef4444;
      --recording-color: #f87171;

      --chip-high-bg: #3f2222;
      --chip-high-text: #fca5a5;
      --chip-normal-bg: #423213;
      --chip-normal-text: #fcd34d;
      --chip-low-bg: #1c3224;
      --chip-low-text: #86efac;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.1);
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    *, *::before, *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: var(--font-sans);
      background-color: var(--bg-primary);
      color: var(--text-primary);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      transition: background-color 0.2s, color 0.2s;
    }

    /* Layout */
    .container {
      max-width: 42rem; /* 672px */
      margin: 0 auto;
      padding: 1rem;
    }
    @media (min-width: 640px) {
      .container { padding: 1.5rem; }
    }
    @media (min-width: 1024px) {
      .container { padding: 2rem; }
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin: 0;
    }
    .header h1 .subtitle {
        font-size: 1.125rem;
        font-weight: 400;
        color: var(--text-secondary);
        display: none;
    }
    @media (min-width: 640px) {
        .header h1 .subtitle { display: inline; }
    }


    /* Surface */
    .card {
      background-color: var(--bg-secondary);
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
      margin-bottom: 1.5rem;
      transition: background-color 0.2s;
    }
    .card-body {
        padding: 1rem;
    }
     @media (min-width: 640px) {
      .card-body { padding: 1.5rem; }
    }
    .card-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
    }
    @media (min-width: 640px) {
      .card-header { flex-direction: row; }
    }


    /* Forms */
    .input, .select, .date {
      width: 100%;
      padding: 0.5rem 0.75rem;
      background-color: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 0.375rem;
      color: var(--text-primary);
      transition: background-color 0.2s, border-color 0.2s;
    }
    .input:focus-visible, .select:focus-visible, .date:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
        border-color: var(--brand-color);
        box-shadow: 0 0 0 2px var(--focus-ring-color);
    }
    .form-row {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
     @media (min-width: 640px) {
      .form-row { flex-direction: row; align-items: center; }
      .form-row .input { flex-grow: 1; }
    }
    .form-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    @media (min-width: 640px) {
      .form-controls { flex-direction: row; }
    }


    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1.25rem;
      font-weight: 600;
      border-radius: 0.375rem;
      border: 1px solid transparent;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s;
      white-space: nowrap;
    }
    .btn:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--focus-ring-color);
    }
    .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .btn.primary {
        background-color: var(--brand-color);
        color: var(--btn-text-color);
    }
    .btn.primary:not(:disabled):hover {
        background-color: var(--brand-color-hover);
    }
    .btn.secondary {
        background-color: var(--bg-primary);
        color: var(--text-primary);
        border-color: var(--border-color);
    }
    .btn.secondary:not(:disabled):hover {
        background-color: var(--border-color);
    }
    .btn-ghost {
      background: transparent;
      border: none;
      padding: 0.5rem;
      border-radius: 9999px;
      color: var(--text-secondary);
    }
    .btn-ghost:hover {
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }

    .btn-voice {
      background-color: var(--bg-primary);
      color: var(--text-secondary);
      border: 1px solid var(--border-color);
      padding: 0.5rem; /* Make it square */
      width: 38px;
      height: 38px;
    }
    .btn-voice:not(:disabled):hover {
      background-color: var(--border-color);
      color: var(--text-primary);
    }
    .btn-voice.recording {
      background-color: var(--recording-color);
      border-color: var(--recording-color);
      color: white;
      animation: pulse 1.5s infinite ease-in-out;
    }
    .loader {
      width: 1rem;
      height: 1rem;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      display: inline-block;
      animation: spin 0.6s linear infinite;
    }

    /* Filters / Tabs */
    [role="tablist"] {
      display: inline-flex;
      align-items: center;
      background-color: var(--bg-primary);
      border-radius: 0.5rem;
      padding: 0.25rem;
    }
    [role="tab"] {
      padding: 0.375rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border: none;
      background: none;
      border-radius: 0.375rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s, box-shadow 0.2s;
    }
    [role="tab"]:hover {
        color: var(--text-primary);
    }
    [role="tab"][aria-selected="true"] {
      background-color: var(--bg-secondary);
      color: var(--brand-color);
      box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
    }
    [role="tab"]:focus-visible {
        outline: 2px solid transparent;
        outline-offset: 2px;
        box-shadow: 0 0 0 2px var(--focus-ring-color);
    }
    

    /* Task List */
    ul.tasks {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    ul.tasks.divide-y > li:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
    }
    li.task-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      transition: background-color 0.15s ease-in-out;
    }
    li.task-item:hover {
      background-color: var(--bg-primary);
    }
    .task-checkbox {
        flex-shrink: 0;
        margin-top: 0.25rem;
    }
    .task-content {
        flex-grow: 1;
    }
    .task-title {
        color: var(--text-primary);
    }
    .task-title.done {
        text-decoration: line-through;
        color: var(--text-secondary);
    }
    .task-meta {
        font-size: 0.75rem;
        color: var(--text-secondary);
        margin-top: 0.25rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
    }
    .task-actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }


    /* Chips */
    .chip {
      display: inline-flex;
      padding: 0.125rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
    }
    .chip[data-level="high"] {
      background-color: var(--chip-high-bg);
      color: var(--chip-high-text);
    }
    .chip[data-level="normal"] {
      background-color: var(--chip-normal-bg);
      color: var(--chip-normal-text);
    }
    .chip[data-level="low"] {
      background-color: var(--chip-low-bg);
      color: var(--chip-low-text);
    }


    /* Utilities */
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }
    .muted {
        color: var(--text-secondary);
    }
    .text-center {
        text-align: center;
    }
    .clear-btn {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--danger-color);
        background: none;
        border: none;
        cursor: pointer;
    }
    .clear-btn:hover {
        color: var(--danger-color-hover);
    }
  `;
  document.head.appendChild(style);
}