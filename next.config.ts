/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: 'http://localhost:5050/api/:path*', // Proxy to Backend
      },
    ]
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5050',
  },
  serverActions: {
    bodySizeLimit: '10mb', // Increase the body size limit to 10 MB
  },
}

export default nextConfig;