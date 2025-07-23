/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skip type checking during build for faster iteration
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable Turbopack for faster development builds
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Server external packages
  serverExternalPackages: ['pg', 'sequelize'],

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle CSS modules
    config.module.rules.push({
      test: /\.module\.css$/,
      use: [
        defaultLoaders.babel,
        {
          loader: 'css-loader',
          options: {
            modules: true,
          },
        },
      ],
    });

    return config;
  },

  // Output configuration
  output: 'standalone',
  
  // Asset optimization
  images: {
    domains: ['cdn.jsdelivr.net'],
    formats: ['image/webp', 'image/avif'],
  },

  // Compression and optimization
  compress: true,
  poweredByHeader: false,

  // Environment variables
  env: {
    CDN_BOOTSTRAP: process.env.CDN_BOOTSTRAP,
    CDN_HANZI: process.env.CDN_HANZI,
    CDN_TINYMCE: process.env.CDN_TINYMCE,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    AUTH_RATE_LIMIT_MAX: process.env.AUTH_RATE_LIMIT_MAX,
    API_RATE_LIMIT_MAX: process.env.API_RATE_LIMIT_MAX,
    UPLOAD_MAX_SIZE: process.env.UPLOAD_MAX_SIZE,
    UPLOAD_ALLOWED_TYPES: process.env.UPLOAD_ALLOWED_TYPES,
    LOG_LEVEL: process.env.LOG_LEVEL,
  },

  // API routes are now handled by Next.js
  async rewrites() {
    return [
      // Legacy admin routes still handled by Express backend
      {
        source: '/admin/:path*',
        destination: 'http://localhost:9005/admin/:path*',
      },
    ];
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
