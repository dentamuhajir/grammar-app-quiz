import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// `base` is where the app is served from.
// - Vercel serves from the domain root -> "/".
// - GitHub Pages serves from a repo sub-path -> "/grammar-app-quiz/".
// The GitHub Actions workflow sets DEPLOY_TARGET=ghpages; Vercel leaves it
// unset, so it defaults to "/".
export default defineConfig(({ mode }) => {
  // "" = load env from the current working directory. Empty prefix ("") so
  // DEPLOY_TARGET (no VITE_ prefix) is picked up too.
  const env = loadEnv(mode, "", "");
  const base = env.DEPLOY_TARGET === "ghpages" ? "/grammar-app-quiz/" : "/";
  return {
    plugins: [react()],
    base,
  };
});
