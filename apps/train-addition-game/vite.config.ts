/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
  server: {
    host: true,
    open: true,
    allowedHosts: true
  },
  envDir: "../../",
  test: {
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["src/tests/e2e/**", "node_modules/**"],
    globals: true,
    environment: "jsdom",
  },
  // הגדרות לבנייה דיבאגבילית
  build: {
    sourcemap: true, // יצירת מפות קוד (מאפשר לראות קוד מקור ב-Logs)
    minify: false, // ביטול כיווץ הקוד (הקוד יהיה קריא יותר)
  },
  dev: {
    sourcemap: true,
  },
});
