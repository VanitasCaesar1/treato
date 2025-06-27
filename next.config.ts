/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  // You can also disable TypeScript checking during builds if needed
  typescript: {
     ignoreBuildErrors: true,
  },
}

module.exports = nextConfig