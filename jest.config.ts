import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest';
import { compilerOptions } from './tsconfig.json';

const tsJestConfig: JestConfigWithTsJest = {
  clearMocks: true,
  coverageDirectory: 'coverage/',
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      compilerOptions.paths,
      { prefix: '<rootDir>/' },
    ),
  },
  preset: 'ts-jest',
  roots: [ '<rootDir>/' ],
  testEnvironment: 'node',
};

const config = {
  collectCoverage: true,
  projects: [ tsJestConfig ],
};

export default config;