const logger = require('../config/logger');

// Database error handling
const handleDatabaseError = (error) => {
  const dbErrors = {
    'SequelizeValidationError': 'Data validation failed',
    'SequelizeUniqueConstraintError': 'Duplicate entry found',
    'SequelizeForeignKeyConstraintError': 'Referenced record not found',
    'SequelizeConnectionError': 'Database connection failed',
    'SequelizeTimeoutError': 'Database operation timed out'
  };

  return dbErrors[error.name] || 'Database error occurred';
};

// API error response formatter
const formatApiError = (error, req) => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    error: true,
    message: error.message || 'An error occurred',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  };

  // Add stack trace in development
  if (isDevelopment && error.stack) {
    errorResponse.stack = error.stack;
  }

  // Add request ID if available
  if (req.requestId) {
    errorResponse.requestId = req.requestId;
  }

  return errorResponse;
};

// Comprehensive error handler middleware
const errorHandler = (error, req, res, next) => {
  // Log the error with context
  logger.error('Application error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.session?.userId,
    timestamp: new Date().toISOString()
  });

  // Set default error status
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';

  // Handle specific error types
  if (error.name && error.name.startsWith('Sequelize')) {
    statusCode = 400;
    message = handleDatabaseError(error);
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  // Handle rate limit errors
  if (error.message?.includes('Too many requests')) {
    statusCode = 429;
  }

  // Determine if request expects JSON
  const acceptsJson = req.accepts(['html', 'json']) === 'json' || 
                      req.path.startsWith('/api/') ||
                      req.get('Content-Type') === 'application/json';

  if (acceptsJson) {
    // API error response
    return res.status(statusCode).json(formatApiError(error, req));
  } else {
    // Web page error response
    const errorView = statusCode === 404 ? '404' : 'error';
    const title = statusCode === 404 ? '页面未找到' : '服务器错误';
    
    return res.status(statusCode).render(errorView, {
      title,
      error: process.env.NODE_ENV === 'development' ? error : { message },
      statusCode
    });
  }
};

// 404 handler for unmatched routes
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.path}`);
  error.statusCode = 404;
  
  logger.warn('Route not found:', {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  next(error);
};

// Async error wrapper to catch async route errors
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global unhandled rejection handler
const setupGlobalErrorHandlers = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Exit gracefully
    process.exit(1);
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupGlobalErrorHandlers,
  formatApiError,
  handleDatabaseError
};