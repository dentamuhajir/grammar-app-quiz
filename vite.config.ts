import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the GitHub repo name so assets resolve on GitHub Pages
// e.g. https://<user>.github.io/grammar-app-quiz/
export default defineConfig({
  plugins: [react()],
  base: "/grammar-app-quiz/",
});
