import type { NextConfig } from "next";

/**
 * Deployment-target switch (DEPLOYMENT_HAWKHOST.md, docs/SYSTEM_ARCHITECTURE.md §13).
 *
 *   DEPLOY_TARGET=static -> full static export to apps/web/out (shared-hosting profile)
 *   otherwise            -> normal static-first, server-capable Next.js build
 *
 * `output: "export"` is a deployment profile, never a permanent architecture constraint.
 */
const isStaticExport = process.env.DEPLOY_TARGET === "static";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  // Directory-style URLs (/feeding/ -> feeding/index.html) so Apache serves the export without rewrite rules.
  trailingSlash: isStaticExport,
  images: {
    unoptimized: isStaticExport,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  // Workspace packages ship TypeScript source; Next compiles them in place.
  transpilePackages: ["@howtobaby/themes", "@howtobaby/ui"],
};

export default nextConfig;
