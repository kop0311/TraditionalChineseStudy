const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  formatApiError,
  handleDatabaseError
} = require('../../middleware/errorHandler');

describe('Error Handler Middleware', () => {
  describe('Database Error Handling', () => {
    test('should format Sequelize validation errors', () => {
      const error = { name: 'SequelizeValidationError' };
      const result = handleDatabaseError(error);
      expect(result).toBe('Data validation failed');
    });

    test('should format unique constraint errors', () => {
      const error = { name: 'SequelizeUniqueConstraintError' };
      const result = handleDatabaseError(error);
      expect(result).toBe('Duplicate entry found');
    });

    test('should format foreign key constraint errors', () => {
      const error = { name: 'SequelizeForeignKeyConstraintError' };
      const result = handleDatabaseError(error);
      expect(result).toBe('Referenced record not found');
    });

    test('should format connection errors', () => {
      const error = { name: 'SequelizeConnectionError' };
      const result = handleDatabaseError(error);
      expect(result).toBe('Database connection failed');
    });

    test('should format timeout errors', () => {
      const error = { name: 'SequelizeTimeoutError' };
      const result = handleDatabaseError(error);
      expect(result).toBe('Database operation timed out');
    });

    test('should return generic message for unknown errors', () => {
      const error = { name: 'UnknownError' };
      const result = handleDatabaseError(error);
      expect(result).toBe('Database error occurred');
    });
  });

  describe('API Error Formatting', () => {
    test('should format API error response', () => {
      const error = new Error('Test error');
      const mockReq = {
        path: '/api/test',
        method: 'POST'
      };

      const result = formatApiError(error, mockReq);

      expect(result).toMatchObject({
        error: true,
        message: 'Test error',
        path: '/api/test',
        method: 'POST'
      });
      expect(result.timestamp).toBeDefined();
    });

    test('should include stack trace in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      const mockReq = { path: '/test', method: 'GET' };

      const result = formatApiError(error, mockReq);

      expect(result.stack).toBe('Error stack trace');

      process.env.NODE_ENV = originalEnv;
    });

    test('should include request ID if available', () => {
      const error = new Error('Test error');
      const mockReq = {
        path: '/test',
        method: 'GET',
        requestId: 'req-123'
      };

      const result = formatApiError(error, mockReq);

      expect(result.requestId).toBe('req-123');
    });
  });

  describe('Error Handler', () => {
    test('should handle Sequelize errors with 400 status', () => {
      const error = new Error('Validation failed');
      error.name = 'SequelizeValidationError';

      const mockReq = {
        url: '/test',
        method: 'POST',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        accepts: jest.fn().mockReturnValue('json'),
        path: '/api/test'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockNext = jest.fn();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('should handle JWT errors with 401 status', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      const mockReq = {
        url: '/test',
        method: 'POST',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        accepts: jest.fn().mockReturnValue('json'),
        path: '/api/test'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockNext = jest.fn();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('should render error page for web requests', () => {
      const error = new Error('Server error');

      const mockReq = {
        url: '/dashboard',
        method: 'GET',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        accepts: jest.fn().mockReturnValue('html'),
        path: '/dashboard'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        render: jest.fn()
      };

      const mockNext = jest.fn();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.render).toHaveBeenCalledWith('error', expect.any(Object));
    });

    test('should handle rate limit errors', () => {
      const error = new Error('Too many requests from this IP');

      const mockReq = {
        url: '/test',
        method: 'POST',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent'),
        accepts: jest.fn().mockReturnValue('json'),
        path: '/api/test'
      };

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const mockNext = jest.fn();

      errorHandler(error, mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(429);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('Not Found Handler', () => {
    test('should create 404 error for unmatched routes', () => {
      const mockReq = {
        method: 'GET',
        path: '/nonexistent',
        url: '/nonexistent',
        ip: '127.0.0.1',
        get: jest.fn().mockReturnValue('test-agent')
      };

      const mockRes = {};
      const mockNext = jest.fn();

      notFoundHandler(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      const error = mockNext.mock.calls[0][0];
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('Route not found');
    });
  });

  describe('Async Handler', () => {
    test('should handle successful async operations', async () => {
      const asyncFn = jest.fn().mockResolvedValue('success');
      const wrappedFn = asyncHandler(asyncFn);

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should catch async errors and pass to next', async () => {
      const error = new Error('Async error');
      const asyncFn = jest.fn().mockRejectedValue(error);
      const wrappedFn = asyncHandler(asyncFn);

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      await wrappedFn(mockReq, mockRes, mockNext);

      expect(asyncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });

    test('should handle non-promise functions', () => {
      const syncFn = jest.fn();
      const wrappedFn = asyncHandler(syncFn);

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      wrappedFn(mockReq, mockRes, mockNext);

      expect(syncFn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});