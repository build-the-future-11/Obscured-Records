import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = fileURLToPath(new URL("../", import.meta.url));

// These isolated CLI doubles test dispatch and argument/exit-code forwarding.
// They do not substitute for the real Cloudflare and Next.js builds in CI.
function run({ command = "build", args = [], vercel, profile, exitCode = 0 } = {}) {
  const directory = mkdtempSync(join(tmpdir(), "obscured-framework-"));
  function write(path, content) {
    const destination = join(directory, path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, content);
  }
  try {
    write("package.json", '{"type":"module"}\n');
    mkdirSync(join(directory, "scripts"), { recursive: true });
    for (const name of ["run-framework.mjs", "execution-profile.mjs"]) {
      copyFileSync(join(root, "scripts", name), join(directory, "scripts", name));
    }
    for (const [framework, path] of [
      ["next", "next/dist/bin/next"],
      ["vite", "vite/bin/vite.js"],
      ["vinext", "vinext/dist/cli.js"],
    ]) {
      write(`node_modules/${framework}/package.json`, '{"type":"commonjs"}\n');
      write(`node_modules/${path}`, `console.log(JSON.stringify({ framework: ${JSON.stringify(framework)}, args: process.argv.slice(2) })); process.exitCode = ${exitCode};\n`);
    }
    write("scripts/build-verified.sh", '#!/usr/bin/env bash\nprintf \'%s\\n\' \'{"framework":"managed-build"}\'\n');
    if (profile !== undefined) {
      write(".sites-runtime/execution-profile.json", JSON.stringify({ executionProfile: profile }));
    }
    const env = { ...process.env };
    delete env.VERCEL;
    if (vercel !== undefined) env.VERCEL = vercel;
    return spawnSync(process.execPath, [join(directory, "scripts/run-framework.mjs"), command, ...args], {
      cwd: directory, env, encoding: "utf8", timeout: 10000,
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

function dispatched(options) {
  const result = run(options);
  assert.equal(result.status, 0, result.stderr || String(result.error));
  return JSON.parse(result.stdout.trim());
}

test("a clean portable build still uses Vinext", () => {
  assert.deepEqual(dispatched(), { framework: "vinext", args: ["build"] });
});

test("portable development retains the preview port", () => {
  assert.deepEqual(dispatched({ command: "dev" }), {
    framework: "vinext", args: ["dev", "--port", "5173"],
  });
});

test("VERCEL=1 selects Next.js for builds and forwards arguments", () => {
  assert.deepEqual(dispatched({ vercel: "1", args: ["--webpack"] }), {
    framework: "next", args: ["build", "--webpack"],
  });
});

test("Vercel development does not inject a Cloudflare preview port", () => {
  assert.deepEqual(dispatched({ vercel: "1", command: "dev", args: ["--port", "3000"] }), {
    framework: "next", args: ["dev", "--port", "3000"],
  });
});

test("Vercel wins over a managed preview profile", () => {
  assert.equal(dispatched({ vercel: "1", profile: "managed-linux" }).framework, "next");
});

test("Vercel does not read an invalid checkout-local profile", () => {
  assert.equal(dispatched({ vercel: "1", profile: "invalid" }).framework, "next");
});

test("VERCEL=0 does not select Next.js", () => {
  assert.equal(dispatched({ vercel: "0" }).framework, "vinext");
});

test("managed development still uses Vite", () => {
  assert.deepEqual(dispatched({ profile: "managed-linux", command: "dev" }), {
    framework: "vite", args: ["dev"],
  });
});

test("managed builds still use the verified build script", () => {
  assert.equal(dispatched({ profile: "managed-linux" }).framework, "managed-build");
});

test("an invalid non-Vercel profile still fails closed", () => {
  const result = run({ profile: "invalid" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Invalid local execution profile/);
});

test("invalid commands fail before invoking a framework", () => {
  const result = run({ command: "deploy", vercel: "1" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Expected dev or build/);
});

test("Next.js failures retain their nonzero exit code", () => {
  assert.equal(run({ vercel: "1", exitCode: 17 }).status, 17);
});

test("Vercel configuration explicitly selects Next.js and its output", () => {
  const config = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  assert.equal(config.framework, "nextjs");
  assert.equal(config.buildCommand, "npm run build:vercel");
  assert.equal(config.installCommand, "npm run install:ci");
  assert.equal(config.outputDirectory, ".next");
  assert.equal(pkg.scripts["build:vercel"], "next build");
  assert.equal(pkg.scripts["start:vercel"], "next start");
});
