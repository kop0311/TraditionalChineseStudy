const { sequelize } = require('../models');

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.SESSION_SECRET = 'test-secret-key-for-jest-testing-only';
  process.env.DB_NAME = 'xiaoxiao_dushulang_test';
  
  // Suppress console logs during tests (uncomment if needed)
  // console.log = jest.fn();
  // console.warn = jest.fn();
  // console.error = jest.fn();
});

// Global test teardown
afterAll(async () => {
  // Close database connections
  if (sequelize) {
    await sequelize.close();
  }
});

// Reset database before each test (if needed for integration tests)
beforeEach(async () => {
  // Clear rate limiting cache if any
  jest.clearAllMocks();
});

// Common test utilities
global.testUtils = {
  // Mock request object
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    session: {},
    ip: '127.0.0.1',
    get: jest.fn(),
    ...overrides
  }),

  // Mock response object
  mockResponse: () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      render: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
      locals: {}
    };
    return res;
  },

  // Mock next function
  mockNext: () => jest.fn(),

  // Generate test CSRF token
  generateTestCSRFToken: () => 'test-csrf-token-1234567890abcdef',

  // Wait for async operations
  wait: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};