import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true, // Disable image optimization
  },
  async rewrites() {
    return [
      {
        source: '/reset-password',
        destination: '/reset-password',
      },
    ];
  },
};

export default nextConfig;
