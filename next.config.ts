import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  // Reduces deployment footprint & avoids loading unused files into memory
  output: "standalone",
typescript: {
    ignoreBuildErrors: true,
  },
  // Large memory cost at runtime — disable in production
  productionBrowserSourceMaps: false,

  // Pin the Turbopack root to this project (silences the multi-lockfile warning)
  turbopack: {
    root: path.resolve(__dirname),
  },

  images: {
    formats: ["image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ],
    // Longer cache TTL avoids repeated image re-processing in memory
    minimumCacheTTL: 86400,
  },

  // Keep heavy server-only packages out of the client bundle
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "bcryptjs",
    "cloudinary",
    "@azure/storage-blob",
  ],
}

export default nextConfig
