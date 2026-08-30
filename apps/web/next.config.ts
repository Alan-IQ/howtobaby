import type { NextConfig } from "next";

const isStaticExport = process.env.DEPLOY_TARGET === "static";

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export" as const } : {}),
  trailingSlash: isStaticExport,
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;
