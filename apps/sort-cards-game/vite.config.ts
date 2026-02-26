import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import devtoolsJson from "vite-plugin-devtools-json";

export default defineConfig({
  plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
  server: {
    host: true,
    open: true,
    allowedHosts: true,
  },
  envDir: "../../",
  build: {
    sourcemap: true,
    minify: false,
  },
  dev: {
    sourcemap: true,
  },
});
