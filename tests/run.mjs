import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// esbuild is provided by Vite; no additional test framework is needed.
const temporary = await mkdtemp(join(tmpdir(), "grammar-basics-tests-"));
try {
  await build({ entryPoints: ["tests/articles.test.ts", "tests/basics.test.ts", "tests/feedback.test.ts", "tests/qa.test.ts", "tests/sentence.test.ts", "tests/story.test.ts"], outdir: temporary, outExtension: { ".js": ".mjs" }, bundle: true, platform: "node", format: "esm", jsx: "automatic" });
  const result = spawnSync(process.execPath, ["--test", "tests/roleplay.test.mjs", "tests/story-tutor.test.mjs", join(temporary, "articles.test.mjs"), join(temporary, "basics.test.mjs"), join(temporary, "feedback.test.mjs"), join(temporary, "qa.test.mjs"), join(temporary, "sentence.test.mjs"), join(temporary, "story.test.mjs")], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
