import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { analyticsService } from './services/analyticsService'
import { I18nProvider } from './i18n'

// Catch unhandled errors globally (ignore opaque cross-origin "Script error.")
window.addEventListener('error', (event) => {
  const err = event.error || event.message;
  if (!err || err === 'Script error.' || err === 'Script error') return;
  analyticsService.logError(err, { fatal: true });
});

// Catch unhandled promise rejections globally
window.addEventListener('unhandledrejection', (event) => {
  if (!event.reason) return;
  analyticsService.logError(event.reason, { fatal: true });
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
