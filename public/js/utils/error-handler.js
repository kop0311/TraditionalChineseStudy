/**
 * Error Handler Utility
 * Centralized error handling and reporting
 */

export class ErrorHandler {
  static instance = null;
  
  constructor() {
    if (ErrorHandler.instance) {
      return ErrorHandler.instance;
    }
    
    this.errors = [];
    this.maxErrors = 100;
    this.isInitialized = false;
    
    ErrorHandler.instance = this;
  }

  /**
   * Initialize error handling
   */
  static init() {
    const handler = new ErrorHandler();
    
    if (handler.isInitialized) return handler;

    // Global error handler
    window.addEventListener('error', (event) => {
      handler.handleError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        type: 'javascript',
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      handler.handleError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
        type: 'promise',
      });
    });

    // Resource loading error handler
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        handler.handleError({
          message: 'Resource loading failed',
          source: event.target.src || event.target.href,
          type: 'resource',
          element: event.target.tagName,
        });
      }
    }, true);

    handler.isInitialized = true;
    console.log('🛡️ Error handler initialized');
    
    return handler;
  }

  /**
   * Handle an error
   */
  static handleError(error) {
    const handler = ErrorHandler.instance || new ErrorHandler();
    return handler.handleError(error);
  }

  /**
   * Handle an error instance
   */
  handleError(error) {
    const errorInfo = this.normalizeError(error);
    
    // Add to error log
    this.addError(errorInfo);
    
    // Log to console
    this.logError(errorInfo);
    
    // Report to monitoring service (if configured)
    this.reportError(errorInfo);
    
    // Show user notification for critical errors
    if (errorInfo.severity === 'critical') {
      this.showErrorNotification(errorInfo);
    }
    
    return errorInfo;
  }

  /**
   * Normalize error to consistent format
   */
  normalizeError(error) {
    const timestamp = Date.now();
    const userAgent = navigator.userAgent;
    const url = window.location.href;
    
    let errorInfo = {
      id: this.generateErrorId(),
      timestamp,
      url,
      userAgent,
      severity: 'error',
    };

    if (error instanceof Error) {
      errorInfo = {
        ...errorInfo,
        message: error.message,
        stack: error.stack,
        name: error.name,
        type: 'javascript',
      };
    } else if (typeof error === 'object' && error !== null) {
      errorInfo = { ...errorInfo, ...error };
    } else if (typeof error === 'string') {
      errorInfo = {
        ...errorInfo,
        message: error,
        type: 'generic',
      };
    }

    // Determine severity
    errorInfo.severity = this.determineSeverity(errorInfo);
    
    return errorInfo;
  }

  /**
   * Determine error severity
   */
  determineSeverity(errorInfo) {
    // Critical errors
    if (errorInfo.type === 'resource' && errorInfo.element === 'SCRIPT') {
      return 'critical';
    }
    
    if (errorInfo.message && errorInfo.message.includes('ChunkLoadError')) {
      return 'critical';
    }
    
    // High severity errors
    if (errorInfo.type === 'promise') {
      return 'high';
    }
    
    if (errorInfo.message && errorInfo.message.includes('Network Error')) {
      return 'high';
    }
    
    // Medium severity (default)
    return 'medium';
  }

  /**
   * Add error to log
   */
  addError(errorInfo) {
    this.errors.unshift(errorInfo);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }
  }

  /**
   * Log error to console
   */
  logError(errorInfo) {
    const emoji = this.getSeverityEmoji(errorInfo.severity);
    const prefix = `${emoji} [${errorInfo.severity.toUpperCase()}]`;
    
    console.group(`${prefix} Error ${errorInfo.id}`);
    console.error('Message:', errorInfo.message);
    console.error('Type:', errorInfo.type);
    console.error('URL:', errorInfo.url);
    console.error('Timestamp:', new Date(errorInfo.timestamp).toISOString());
    
    if (errorInfo.stack) {
      console.error('Stack:', errorInfo.stack);
    }
    
    if (errorInfo.filename) {
      console.error('File:', `${errorInfo.filename}:${errorInfo.lineno}:${errorInfo.colno}`);
    }
    
    console.groupEnd();
  }

  /**
   * Get emoji for severity level
   */
  getSeverityEmoji(severity) {
    const emojis = {
      critical: '🚨',
      high: '⚠️',
      medium: '⚡',
      low: 'ℹ️',
    };
    
    return emojis[severity] || '❓';
  }

  /**
   * Report error to monitoring service
   */
  reportError(errorInfo) {
    // Skip reporting in development
    if (__DEV__) return;
    
    // TODO: Implement error reporting to external service
    // Example: Sentry, LogRocket, etc.
    
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorInfo),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch (e) {
      // Silently fail
    }
  }

  /**
   * Show error notification to user
   */
  showErrorNotification(errorInfo) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-notification-content">
        <strong>出现了一个问题</strong>
        <p>页面遇到了技术问题，请刷新页面重试。</p>
        <button onclick="window.location.reload()">刷新页面</button>
        <button onclick="this.parentElement.parentElement.remove()">关闭</button>
      </div>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Generate unique error ID
   */
  generateErrorId() {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get error statistics
   */
  getStats() {
    const stats = {
      total: this.errors.length,
      bySeverity: {},
      byType: {},
      recent: this.errors.slice(0, 10),
    };
    
    this.errors.forEach(error => {
      // Count by severity
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
      
      // Count by type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Clear error log
   */
  clearErrors() {
    this.errors = [];
  }

  /**
   * Get all errors
   */
  getErrors() {
    return [...this.errors];
  }
}
