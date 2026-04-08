import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode for catching bugs early
  reactStrictMode: true,

  // iyzipay Node.js modülü — Turbopack bundle etmemeli (fs + dynamic require kullanır)
  serverExternalPackages: ['iyzipay'],

  /**
   * Sprint C runtime fix:
   * iyzipay's lib/resources/ folder is loaded via dynamic
   * `fs.readdirSync(__dirname + '/resources/')` at runtime. Vercel's
   * lambda file tracer does not detect dynamic fs scans, so the
   * resources/*.js files were missing from the production bundle and
   * /api/payment/create was hitting:
   *   ENOENT: scandir '/var/task/node_modules/iyzipay/lib/resources'
   *
   * outputFileTracingIncludes explicitly bundles the resources folder
   * with the routes that import iyzipay (the create + callback handlers).
   * Sibling lib files are also included so the SDK can resolve its own
   * internal imports.
   */
  outputFileTracingIncludes: {
    '/api/payment/create': [
      './node_modules/iyzipay/lib/**/*',
    ],
    '/api/payment/callback': [
      './node_modules/iyzipay/lib/**/*',
    ],
  },

  // Security headers
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],

  // Image optimization — add domains if external images are used
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Powered-by header'ı kaldır
  poweredByHeader: false,
};

export default nextConfig;
