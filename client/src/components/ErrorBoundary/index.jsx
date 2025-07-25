import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-red-500 text-xl">⚠️</span>
            <h3 className="font-semibold text-red-800 dark:text-red-200">
              Something went wrong
            </h3>
          </div>
          <p className="text-red-600 dark:text-red-300 text-sm mb-3">
            {this.props.fallbackMessage || 'An error occurred while loading this component.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-sm bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-3 py-1 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
