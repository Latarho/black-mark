import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
/** Корень репозитория (родитель `web/`): lockfile и `node_modules` с workspaces. */
const monorepoRoot = path.join(__dirname, "..")

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: monorepoRoot,
  },
  outputFileTracingRoot: monorepoRoot,
}

export default nextConfig
