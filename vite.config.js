import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api/resume": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/api/scrape": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});