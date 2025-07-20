module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: 'tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/polyfills.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'text-summary', 'lcov'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],
  transformIgnorePatterns: [
    'node_modules/(?!(@angular|@ngrx|ngx-socket-io|.*\\.mjs$))',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|js)',
    '<rootDir>/src/**/*.(test|spec).(ts|js)',
  ],
  restoreMocks: true,
};
