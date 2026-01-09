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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-2xl w-full p-6 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-red-500 text-3xl">⚠️</span>
              <h3 className="font-bold text-xl text-red-800 dark:text-red-200">
                Something went wrong
              </h3>
            </div>
            <p className="text-red-600 dark:text-red-300 text-sm mb-4">
              {this.props.fallbackMessage || 'An error occurred while loading this component.'}
            </p>
            {this.state.error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <p className="text-xs font-mono text-red-700 dark:text-red-300 mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </p>
                {this.state.error.stack && (
                  <details className="text-xs font-mono text-red-600 dark:text-red-400">
                    <summary className="cursor-pointer hover:text-red-700 dark:hover:text-red-300">
                      Stack trace
                    </summary>
                    <pre className="mt-2 p-2 bg-red-100 dark:bg-red-950/50 rounded overflow-auto max-h-60">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors font-semibold"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="flex-1 text-sm bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors font-semibold"
              >
                Clear Data & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
