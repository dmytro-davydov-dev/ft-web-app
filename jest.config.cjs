/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/src/test/styleMock.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',

    // ── MUI — redirect ALL @mui/material imports to a single transparent mock
    '^@mui/material/styles$':  '<rootDir>/src/test/muiMock.tsx',
    '^@mui/material/(.+)$':    '<rootDir>/src/test/muiMock.tsx',
    '^@mui/material$':         '<rootDir>/src/test/muiMock.tsx',

    // ── @mui/icons-material — any icon → null component
    '^@mui/icons-material/(.+)$': '<rootDir>/src/test/muiMock.tsx',
    '^@mui/icons-material$':      '<rootDir>/src/test/muiMock.tsx',

    // ── Emotion — no-op stubs (not needed at runtime in tests)
    '^@emotion/react$':    '<rootDir>/src/test/emotionMock.ts',
    '^@emotion/styled$':   '<rootDir>/src/test/emotionMock.ts',
    '^@emotion/cache$':    '<rootDir>/src/test/emotionMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: '<rootDir>/tsconfig.app.json',
      },
    ],
  },
  testMatch: ['**/?(*.)+(test).ts?(x)'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/main.tsx'],
};
