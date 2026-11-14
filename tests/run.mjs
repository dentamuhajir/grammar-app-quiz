import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

// esbuild is provided by Vite; no additional test framework is needed.
const temporary = await mkdtemp(join(tmpdir(), "grammar-basics-tests-"));
try {
  await build({ entryPoints: ["tests/articles.test.ts", "tests/basics.test.ts", "tests/qa.test.ts", "tests/sentence.test.ts"], outdir: temporary, outExtension: { ".js": ".mjs" }, bundle: true, platform: "node", format: "esm" });
  const result = spawnSync(process.execPath, ["--test", join(temporary, "articles.test.mjs"), join(temporary, "basics.test.mjs"), join(temporary, "qa.test.mjs"), join(temporary, "sentence.test.mjs")], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  await rm(temporary, { recursive: true, force: true });
}
