/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Verified clean (`tsc --noEmit` passes) — no longer ignoring errors
    // so future regressions actually fail the build instead of shipping silently.
    ignoreBuildErrors: false,
  },
  eslint: {
    // No ESLint config exists in this repo yet (`next lint` has never been run).
    // Keep this true until an eslint.config.mjs is added, otherwise builds
    // will fail on the missing config rather than real lint errors.
    ignoreDuringBuilds: true,
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
};

module.exports = nextConfig;