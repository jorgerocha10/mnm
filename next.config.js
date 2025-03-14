/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript errors during production builds (use with caution)
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['placehold.co'],
  },
};

module.exports = nextConfig; 