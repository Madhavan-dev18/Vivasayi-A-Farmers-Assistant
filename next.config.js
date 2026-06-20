/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Verified clean (`tsc --noEmit` passes) — no longer ignoring errors
    // so future regressions actually fail the build instead of shipping silently.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enforce ESLint analysis checks during build phase
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
    ],
  },
  // FIXED: Moved out of the 'experimental' object for Next.js 15
  serverExternalPackages: [
    '@genkit-ai/googleai',
    'handlebars',
    'dotprompt',
    '@opentelemetry/instrumentation',
    'require-in-the-middle',
  ],
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@opentelemetry\/exporter-jaeger$/,
      })
    );
    return config;
  },
};

module.exports = nextConfig;