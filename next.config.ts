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
    // Brown vs. Tatum was retired once they were no longer teammates; the Cal story replaces it
    { source: '/projects/brown-vs-tatum', destination: '/projects/cal-football', permanent: true },
    // The Cal draft study became chapter 3 of the Cal football story; keep old links (resume, LinkedIn) working
    { source: '/projects/cal-pro-pipeline', destination: '/projects/cal-football', permanent: true },
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
