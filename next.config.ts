import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.alphacoders.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'https',
        hostname: '**.samehadaku.io',
      },
      {
        protocol: 'https',
        hostname: 'v2.samehadaku.how',
      },
      {
        protocol: 'https',
        hostname: 'samehadaku.li',
      },
      {
        protocol: 'https',
        hostname: '**.wp.com',
      },
      {
        protocol: 'https',
        hostname: 'samehadaku.ac',
      },
      {
        protocol: 'https',
        hostname: '**.samehadaku.ac',
      },
      {
        protocol: 'https',
        hostname: '**.kotakanimeid.link',
      },
    ],
  },
  experimental: {},
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
