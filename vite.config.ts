import { defineConfig } from "vite";

// Single-page interactive teaser. Assets live in /public/assets so their
// URLs stay stable in both dev and the production build.
export default defineConfig({
  base: "./",
  server: {
    host: true,
    open: true,
  },
  build: {
    target: "es2020",
    assetsInlineLimit: 0,
  },
});
