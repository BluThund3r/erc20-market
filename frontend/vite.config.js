import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    "process.env": {},
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      "@nomicfoundation/edr-win32-x64-msvc",
      "@nomicfoundation/solidity-analyzer-win32-x64-msvc",
    ],
  },
  assetsInclude: ["**/*.node"],
});
