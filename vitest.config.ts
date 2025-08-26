import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,        // allows `describe`, `it`, `expect` without imports
    environment: "node",  // math lib doesn’t need jsdom
    include: ["tests/**/*.test.ts"], // test file location
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
