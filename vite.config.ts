import { defineConfig, loadEnv, type PreviewServer, type ViteDevServer } from "vite";
import react from "@vitejs/plugin-react";
import { handleRoleplay } from "./api/roleplay.js";

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
  function mountRoleplay(server: ViteDevServer | PreviewServer) {
    server.middlewares.use("/api/roleplay", (req, res, next) => {
      handleRoleplay(req, res, env.GEMINI_API_KEY).catch(next);
    });
  }
  return {
    plugins: [react(), { name: "roleplay-api", configureServer: mountRoleplay, configurePreviewServer: mountRoleplay }],
    base,
  };
});
