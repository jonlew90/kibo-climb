import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { analyticsService } from './services/analyticsService'

// Catch unhandled errors globally
window.addEventListener('error', (event) => {
  analyticsService.logError(event.error || event.message, { fatal: true });
});

// Catch unhandled promise rejections globally
window.addEventListener('unhandledrejection', (event) => {
  analyticsService.logError(event.reason || 'Unhandled Promise Rejection', { fatal: true });
});

// Intercept console.error to log unexpected issues securely
const originalConsoleError = console.error;
console.error = (...args) => {
  // We still want to log locally during dev or for normal operation
  originalConsoleError(...args);

  // Format the error arguments into a string to send to analytics
  const errorMessage = args
    .map(arg => {
      if (arg instanceof Error) return arg.message;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch (e) {
          return 'Unstringifiable object';
        }
      }
      return String(arg);
    })
    .join(' ');

  // Avoid recursive loops if analytics logging fails
  if (!errorMessage.includes('Failed to log analytics event')) {
    analyticsService.logError(errorMessage, { fatal: false });
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
