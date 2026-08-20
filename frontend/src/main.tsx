import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Tabler CSS (Bootstrap 5.3 based enterprise framework)
import '@tabler/core/dist/css/tabler.min.css';

// Enterprise UI Custom Overrides (Typography, Aurora Glass, Micro-interactions)
import './styles/theme-override.css';

import App from './App';

// Apply dark mode on initial load
document.documentElement.setAttribute('data-bs-theme', 'dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
