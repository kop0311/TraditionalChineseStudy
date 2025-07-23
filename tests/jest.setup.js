// Jest setup file for environment variables and global configuration

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'xiaoxiao_dushulang_test';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3308';
process.env.DB_USER = 'root';
process.env.DB_PASS = '';
process.env.SESSION_SECRET = 'test-session-secret-for-jest-testing-only';
process.env.ADMIN_PASS = 'test-admin-password';
process.env.PORT = '9001';

// Disable rate limiting for tests
process.env.RATE_LIMIT_WINDOW_MS = '999999999';
process.env.RATE_LIMIT_MAX_REQUESTS = '999999';
process.env.AUTH_RATE_LIMIT_MAX = '999999';
process.env.API_RATE_LIMIT_MAX = '999999';

// Set log level to error to reduce test output noise
process.env.LOG_LEVEL = 'error';

// Increase test timeout for database operations
jest.setTimeout(30000);

// Global test configuration
global.testConfig = {
  skipSlowTests: process.env.SKIP_SLOW_TESTS === 'true',
  testDatabase: process.env.DB_NAME,
  testPort: process.env.PORT,
};
