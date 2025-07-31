/** @type {import('next').NextConfig} */
const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === 'development',
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.letvisitghana.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      }
    ],
  },
  experimental: {
    // The `allowedDevOrigins` key is now at the top level.
  }
};

const isDevelopment = process.env.NODE_ENV === 'development';

const developmentConfig = {
    ...nextConfig,
    experimental: {
        ...nextConfig.experimental,
        // This is to allow cross-origin requests in the development environment.
        allowedDevOrigins: [
            'https://6000-firebase-studio-1753689056863.cluster-ikslh4rdsnbqsvu5nw3v4dqjj2.cloudworkstations.dev',
        ],
    }
}

module.exports = isDevelopment ? developmentConfig : withPWA(nextConfig);
