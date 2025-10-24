import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import router from './router';

// Handle chunk load errors globally - reload page when chunks fail to load
window.addEventListener('error', (event) => {
  if (event.message?.includes('Failed to fetch dynamically imported module') || 
      event.message?.includes('error loading dynamically imported module') ||
      /Loading chunk [\d]+ failed/i.test(event.message)) {
    console.warn('Chunk load error detected, reloading page...');
    window.location.reload();
  }
});

// Handle unhandled promise rejections for dynamic imports
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('Failed to fetch dynamically imported module') ||
      event.reason?.message?.includes('error loading dynamically imported module') ||
      /Loading chunk [\d]+ failed/i.test(event.reason?.message)) {
    console.warn('Chunk load error in promise, reloading page...');
    event.preventDefault();
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

