/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile shared packages
  transpilePackages: ['@propertycheck/database', '@propertycheck/shared'],

  // Image optimization config
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
      {
        // Unsplash images
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        // Pravatar for avatars
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },

  // Experimental features for App Router
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
