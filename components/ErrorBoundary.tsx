'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setTag('errorBoundary', true);
      scope.setContext('errorInfo', errorInfo);
      Sentry.captureException(error);
    });

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h2 className="chinese-title text-2xl mb-4" style={{ color: 'var(--primary-color)' }}>
              服务异常
            </h2>
            
            <p className="text-gray-600 mb-6 chinese-text">
              抱歉，应用程序遇到了意外错误。我们已经记录了这个问题，请稍后重试。
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="btn-chinese btn-primary"
              >
                🔄 重试
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="btn-chinese btn-outline"
              >
                🏠 刷新页面
              </button>
            </div>

            {/* Error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
                <summary className="cursor-pointer font-semibold text-red-600 mb-2">
                  错误详情 (开发模式)
                </summary>
                <div className="text-sm text-gray-700">
                  <p className="font-semibold mb-2">错误信息:</p>
                  <pre className="bg-red-50 p-2 rounded text-xs overflow-auto mb-4">
                    {this.state.error.toString()}
                  </pre>
                  
                  {this.state.errorInfo && (
                    <>
                      <p className="font-semibold mb-2">组件堆栈:</p>
                      <pre className="bg-red-50 p-2 rounded text-xs overflow-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier usage
interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  fallback,
  onError,
}) => {
  return (
    <ErrorBoundary fallback={fallback} onError={onError}>
      {children}
    </ErrorBoundary>
  );
};

// Specialized error boundary for API errors
export const ApiErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const handleApiError = (error: Error, errorInfo: ErrorInfo) => {
    // Log API-specific error details
    console.error('API Error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Send to analytics/monitoring service
    Sentry.withScope((scope) => {
      scope.setTag('errorType', 'api');
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  };

  const apiFallback = (
    <div className="api-error-container p-8 text-center">
      <div className="card-chinese card-minimal">
        <div className="card-chinese-body">
          <h3 className="chinese-title text-xl mb-4">网络连接异常</h3>
          <p className="chinese-text mb-6">
            无法连接到服务器，请检查网络连接后重试。
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-chinese btn-primary"
          >
            🔄 重新加载
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={apiFallback} onError={handleApiError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
