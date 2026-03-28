import type { Config } from 'jest';
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/src'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  moduleNameMapper: {
    '^@/api/(.*)$':     '<rootDir>/src/api/$1',
    '^@/modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/shared/(.*)$':  '<rootDir>/src/shared/$1',
    '^@/config/(.*)$':  '<rootDir>/src/config/$1',
    '^@/infra/(.*)$':   '<rootDir>/src/infrastructure/$1',
  },
};
export default config;
