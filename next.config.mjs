/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },
  // Disable static optimization for pages that use Convex
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Skip static generation for admin pages
  trailingSlash: false,
};

export default nextConfig;
