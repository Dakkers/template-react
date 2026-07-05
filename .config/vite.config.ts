import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// Library build template. React is externalised (declared as a peer dependency)
// so consumers dedupe on their own copy. Adjust `entry`, `external`, and the
// plugin list for the specific package you are building.
export default defineConfig({
  plugins: [
    react(),
    dts({
      // Config lives in .config/, so point dts at the relocated tsconfig
      // (it otherwise auto-resolves tsconfig.json from the vite root).
      tsconfigPath: resolve(__dirname, "tsconfig.json"),
      include: ["src"],
      exclude: ["src/**/*.stories.tsx", "src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "../src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    sourcemap: true,
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
    },
  },
});
