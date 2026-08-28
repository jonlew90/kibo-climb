import React, { Component } from 'react';
import { analyticsService } from '../services/analyticsService';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our analytics service
    analyticsService.logError(error, { fatal: true });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-slate-100 p-4">
          <h1 className="text-3xl font-extrabold text-red-400 mb-4">Oops, something went wrong!</h1>
          <p className="text-center text-slate-300 max-w-md mb-8">
            The game encountered an unexpected error. We've logged this issue so our team can fix it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-3d-cyan px-8 py-3 rounded-full font-bold text-lg"
          >
            Reload Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
