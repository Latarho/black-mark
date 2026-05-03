import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Корень для Turbopack / file tracing:
 * - npm workspaces из корня репо: `next` в `../node_modules`, не в `web/node_modules`
 * - установка только из `web/` (например Vercel Root Directory = `web`): `next` рядом с приложением
 */
function resolveMonorepoRoot(webDir) {
  const nextInWeb = path.join(webDir, "node_modules", "next", "package.json")
  if (fs.existsSync(nextInWeb)) {
    return webDir
  }
  const repoRoot = path.join(webDir, "..")
  const nextAtRepoRoot = path.join(repoRoot, "node_modules", "next", "package.json")
  if (fs.existsSync(nextAtRepoRoot)) {
    return repoRoot
  }
  return webDir
}

const monorepoRoot = resolveMonorepoRoot(__dirname)

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  outputFileTracingRoot: monorepoRoot,
}

export default nextConfig
