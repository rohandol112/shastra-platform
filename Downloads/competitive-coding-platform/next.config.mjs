/** @type {import('next').NextConfig} */

// Backend origin the /backend/* proxy forwards to (server-side, so the
// browser never talks to the HTTP API directly — avoids CORS + mixed content).
const BACKEND_URL = (process.env.BACKEND_URL || "http://nnixi70owzyzfiomblalf97w.195.35.7.46.sslip.io").replace(/\/+$/, "")

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ]
  },
}

export default nextConfig
