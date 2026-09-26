import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readExecutionProfile } from "./execution-profile.mjs";

const [command, ...args] = process.argv.slice(2);
if (!["dev", "build"].includes(command)) throw new Error("Expected dev or build.");

// Vercel needs Next.js output, not a Cloudflare worker in dist/server.
// Check the deployment target before reading any checkout-local preview profile.
const vercel = process.env.VERCEL === "1";
const managedLinux = !vercel && readExecutionProfile() === "managed-linux";

if (managedLinux && command === "build") {
  const result = spawnSync("bash", [
    fileURLToPath(new URL("./build-verified.sh", import.meta.url)), ...args,
  ], { stdio: "inherit" });
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

// Import in this process so the preview owner retains its PID and signals.
const cli = new URL(vercel
  ? "../node_modules/next/dist/bin/next"
  : managedLinux
    ? "../node_modules/vite/bin/vite.js"
    : "../node_modules/vinext/dist/cli.js", import.meta.url);
process.argv = [process.execPath, fileURLToPath(cli), command,
  ...(!vercel && !managedLinux && command === "dev" ? ["--port", "5173"] : []), ...args];
await import(cli.href);
