import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static build. No server, no analytics, no external requests at runtime.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { target: "es2020", sourcemap: false },
});
