export default {
  testEnvironment: "jsdom",
  setupFiles: ["whatwg-fetch"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/tests/mocks/styleMock.js",
  },
  transform: {
    "^.+\\.(js|jsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "ecmascript", jsx: true },
          transform: { react: { runtime: "automatic" } },
        },
      },
    ],
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/tests/e2e/"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/main.jsx", "!src/router/**/*"],
  coverageThreshold: {
    global: { branches: 60, functions: 70, lines: 75, statements: 75 },
  },
};
