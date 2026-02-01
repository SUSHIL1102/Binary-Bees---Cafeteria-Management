/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts", "!**/*.d.ts"],
  coverageDirectory: "coverage",
  globalSetup: "<rootDir>/jest/globalSetup.cjs",
  globalTeardown: "<rootDir>/jest/globalTeardown.cjs",
  setupFilesAfterEnv: ["<rootDir>/jest/setupTests.cjs"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { useESM: true, diagnostics: { ignoreCodes: [151002] } },
    ],
  },
  // Single worker so all tests use the same in-memory MongoDB replica set
  maxWorkers: 1,
};
