/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    host: true,
    open: true,
  },
  envDir: "../../",
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["src/tests/e2e/**", "node_modules/**"],
    globals: true,
    environment: "jsdom",
  },
});
