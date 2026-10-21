import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  root: resolve("browser-fixtures"),
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("test"), "process.env": "{}" },
  resolve: {
    alias: [
      { find: "next/link", replacement: resolve("browser-fixtures/next-link.tsx") },
      { find: "@", replacement: resolve(".") },
    ],
  },
});
