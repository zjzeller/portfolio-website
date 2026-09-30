import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  // The date night map project was removed; send any old links to the projects list
  redirects: async () => [
    { source: '/projects/sf-food-map', destination: '/projects', permanent: true },
    // Brown vs. Tatum was retired once they were no longer teammates; the Cal study replaces it
    { source: '/projects/brown-vs-tatum', destination: '/projects/cal-pro-pipeline', permanent: true },
  ],
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on',
        },
      ],
    },
  ],
};

export default nextConfig;
