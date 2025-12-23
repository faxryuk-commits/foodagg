/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@food-platform/shared'],
  images: {
    domains: ['localhost', 'images.unsplash.com'],
  },
};

module.exports = nextConfig;

