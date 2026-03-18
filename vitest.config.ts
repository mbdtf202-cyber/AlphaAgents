import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "app/**/*.test.ts",
      "lib/**/*.test.ts",
      "packages/**/src/**/*.test.ts",
      "tests/integration/**/*.test.ts",
    ],
    exclude: ["**/node_modules/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
    },
  },
});
