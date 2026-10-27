import React, { Component } from 'react';

/**
 * ErrorBoundary Component
 * Protects application from unhandled component crashes or network failures
 * during dynamic imports (lazy loading).
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback-container" role="alert" aria-live="assertive">
          <div className="error-fallback-card">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We encountered an unexpected issue while rendering this section.</p>
            <button
              type="button"
              className="btn-primary"
              onClick={this.handleReload}
              aria-label="Reload application"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
