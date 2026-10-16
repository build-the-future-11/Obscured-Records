import { spawnSync } from "node:child_process";

// Workers compilation transpiles TypeScript; explicitly check types before a
// deployment build so a remote build cannot silently skip this release gate.
for (const args of [["scripts/generate-editorial-drafts.mjs"], ["scripts/generate-reader-images.mjs"], ["node_modules/typescript/bin/tsc", "--noEmit", "--incremental", "false"]]) {
  const result = spawnSync(process.execPath, args, {stdio:"inherit"});
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
