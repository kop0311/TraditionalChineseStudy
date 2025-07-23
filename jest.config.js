const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environments - separate configurations for different types of tests
  projects: [
    // JSDOM environment for frontend/React component tests
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/tests/components/**/*.test.js',
        '<rootDir>/tests/components/**/*.test.jsx',
        '<rootDir>/tests/components/**/*.test.ts',
        '<rootDir>/tests/components/**/*.test.tsx',
        '<rootDir>/app/**/*.test.js',
        '<rootDir>/app/**/*.test.jsx',
        '<rootDir>/app/**/*.test.ts',
        '<rootDir>/app/**/*.test.tsx',
        '<rootDir>/components/**/*.test.js',
        '<rootDir>/components/**/*.test.jsx',
        '<rootDir>/components/**/*.test.ts',
        '<rootDir>/components/**/*.test.tsx'
      ],
      setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
      moduleNameMapping: {
        // Handle module aliases
        '^@/components/(.*)$': '<rootDir>/components/$1',
        '^@/app/(.*)$': '<rootDir>/app/$1',
        '^@/lib/(.*)$': '<rootDir>/lib/$1',
        '^@/utils/(.*)$': '<rootDir>/utils/$1',
        '^@/(.*)$': '<rootDir>/$1',
        
        // Handle CSS imports (with CSS modules)
        '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        
        // Handle CSS imports (without CSS modules)
        '\\.(css|sass|scss)$': 'identity-obj-proxy',
        
        // Handle image imports
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
          '<rootDir>/tests/__mocks__/fileMock.js',
      },
      collectCoverageFrom: [
        'app/**/*.{js,jsx,ts,tsx}',
        'components/**/*.{js,jsx,ts,tsx}',
        'lib/**/*.{js,jsx,ts,tsx}',
        'utils/**/*.{js,jsx,ts,tsx}',
        '!**/*.d.ts',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!**/.next/**',
        '!**/tests/**',
      ],
    }
  ],
  
  // Global coverage configuration
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect handles that prevent Jest from exiting
  detectOpenHandles: true,
  
  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  // Watch plugins for better development experience
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
