import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';
import { initializeBrowserFallback } from './services/browserFallback';

// Initialize web browser fallback if not inside Electron desktop environment
initializeBrowserFallback();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

