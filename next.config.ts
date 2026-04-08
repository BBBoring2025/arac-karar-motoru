import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strict mode for catching bugs early
  reactStrictMode: true,

  // iyzipay Node.js modülü — Turbopack bundle etmemeli (fs + dynamic require kullanır)
  serverExternalPackages: ['iyzipay'],

  // Sprint C runtime fix (revised):
  // iyzipay's lib/resources/ folder is loaded via dynamic
  // fs.readdirSync(__dirname + '/resources/') at runtime, AND the SDK
  // has 71 transitive dependencies (postman-request + its tree) that
  // Vercel's nft (node-file-trace) cannot follow because of the
  // dynamic require chain.
  //
  // First fix attempt added only iyzipay/lib (glob) which fixed the
  // ENOENT scandir error but exposed the next layer:
  //   Cannot find module 'postman-request'
  //
  // Final fix: explicitly include iyzipay + postman-request + the full
  // transitive tree (71 packages, computed via a node script walking
  // package.json dependencies recursively). Verbose but deterministic.
  //
  // If iyzipay or postman-request adds a new dep, this list must be
  // updated. There is no way around it given the dynamic require pattern.
  outputFileTracingIncludes: {
    '/api/payment/create': [
      './node_modules/iyzipay/**/*',
      './node_modules/postman-request/**/*',
      './node_modules/@postman/**/*',
      './node_modules/agent-base/**/*',
      './node_modules/asn1/**/*',
      './node_modules/assert-plus/**/*',
      './node_modules/asynckit/**/*',
      './node_modules/aws-sign2/**/*',
      './node_modules/aws4/**/*',
      './node_modules/bcrypt-pbkdf/**/*',
      './node_modules/bluebird/**/*',
      './node_modules/call-bind-apply-helpers/**/*',
      './node_modules/call-bound/**/*',
      './node_modules/caseless/**/*',
      './node_modules/combined-stream/**/*',
      './node_modules/core-util-is/**/*',
      './node_modules/dashdash/**/*',
      './node_modules/debug/**/*',
      './node_modules/delayed-stream/**/*',
      './node_modules/dunder-proto/**/*',
      './node_modules/ecc-jsbn/**/*',
      './node_modules/es-define-property/**/*',
      './node_modules/es-errors/**/*',
      './node_modules/es-object-atoms/**/*',
      './node_modules/extend/**/*',
      './node_modules/extsprintf/**/*',
      './node_modules/forever-agent/**/*',
      './node_modules/function-bind/**/*',
      './node_modules/get-intrinsic/**/*',
      './node_modules/get-proto/**/*',
      './node_modules/getpass/**/*',
      './node_modules/gopd/**/*',
      './node_modules/has-symbols/**/*',
      './node_modules/hasown/**/*',
      './node_modules/http-signature/**/*',
      './node_modules/ip-address/**/*',
      './node_modules/is-typedarray/**/*',
      './node_modules/isstream/**/*',
      './node_modules/jsbn/**/*',
      './node_modules/json-schema/**/*',
      './node_modules/json-stringify-safe/**/*',
      './node_modules/jsprim/**/*',
      './node_modules/math-intrinsics/**/*',
      './node_modules/mime-db/**/*',
      './node_modules/mime-types/**/*',
      './node_modules/ms/**/*',
      './node_modules/oauth-sign/**/*',
      './node_modules/object-inspect/**/*',
      './node_modules/psl/**/*',
      './node_modules/punycode/**/*',
      './node_modules/qs/**/*',
      './node_modules/querystringify/**/*',
      './node_modules/requires-port/**/*',
      './node_modules/safe-buffer/**/*',
      './node_modules/safer-buffer/**/*',
      './node_modules/side-channel/**/*',
      './node_modules/side-channel-list/**/*',
      './node_modules/side-channel-map/**/*',
      './node_modules/side-channel-weakmap/**/*',
      './node_modules/smart-buffer/**/*',
      './node_modules/socks/**/*',
      './node_modules/socks-proxy-agent/**/*',
      './node_modules/sshpk/**/*',
      './node_modules/stream-length/**/*',
      './node_modules/tweetnacl/**/*',
      './node_modules/universalify/**/*',
      './node_modules/url-parse/**/*',
      './node_modules/uuid/**/*',
      './node_modules/verror/**/*',
    ],
    '/api/payment/callback': [
      './node_modules/iyzipay/**/*',
      './node_modules/postman-request/**/*',
      './node_modules/@postman/**/*',
      './node_modules/agent-base/**/*',
      './node_modules/asn1/**/*',
      './node_modules/assert-plus/**/*',
      './node_modules/asynckit/**/*',
      './node_modules/aws-sign2/**/*',
      './node_modules/aws4/**/*',
      './node_modules/bcrypt-pbkdf/**/*',
      './node_modules/bluebird/**/*',
      './node_modules/call-bind-apply-helpers/**/*',
      './node_modules/call-bound/**/*',
      './node_modules/caseless/**/*',
      './node_modules/combined-stream/**/*',
      './node_modules/core-util-is/**/*',
      './node_modules/dashdash/**/*',
      './node_modules/debug/**/*',
      './node_modules/delayed-stream/**/*',
      './node_modules/dunder-proto/**/*',
      './node_modules/ecc-jsbn/**/*',
      './node_modules/es-define-property/**/*',
      './node_modules/es-errors/**/*',
      './node_modules/es-object-atoms/**/*',
      './node_modules/extend/**/*',
      './node_modules/extsprintf/**/*',
      './node_modules/forever-agent/**/*',
      './node_modules/function-bind/**/*',
      './node_modules/get-intrinsic/**/*',
      './node_modules/get-proto/**/*',
      './node_modules/getpass/**/*',
      './node_modules/gopd/**/*',
      './node_modules/has-symbols/**/*',
      './node_modules/hasown/**/*',
      './node_modules/http-signature/**/*',
      './node_modules/ip-address/**/*',
      './node_modules/is-typedarray/**/*',
      './node_modules/isstream/**/*',
      './node_modules/jsbn/**/*',
      './node_modules/json-schema/**/*',
      './node_modules/json-stringify-safe/**/*',
      './node_modules/jsprim/**/*',
      './node_modules/math-intrinsics/**/*',
      './node_modules/mime-db/**/*',
      './node_modules/mime-types/**/*',
      './node_modules/ms/**/*',
      './node_modules/oauth-sign/**/*',
      './node_modules/object-inspect/**/*',
      './node_modules/psl/**/*',
      './node_modules/punycode/**/*',
      './node_modules/qs/**/*',
      './node_modules/querystringify/**/*',
      './node_modules/requires-port/**/*',
      './node_modules/safe-buffer/**/*',
      './node_modules/safer-buffer/**/*',
      './node_modules/side-channel/**/*',
      './node_modules/side-channel-list/**/*',
      './node_modules/side-channel-map/**/*',
      './node_modules/side-channel-weakmap/**/*',
      './node_modules/smart-buffer/**/*',
      './node_modules/socks/**/*',
      './node_modules/socks-proxy-agent/**/*',
      './node_modules/sshpk/**/*',
      './node_modules/stream-length/**/*',
      './node_modules/tweetnacl/**/*',
      './node_modules/universalify/**/*',
      './node_modules/url-parse/**/*',
      './node_modules/uuid/**/*',
      './node_modules/verror/**/*',
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
