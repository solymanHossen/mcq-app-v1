import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Produces a self-contained `.next/standalone` build (just the server and
  // the production-only dependencies it actually traces as used) instead of
  // requiring `node_modules` copied in full — the Dockerfile at the repo
  // root depends on this to keep the production image small.
  output: 'standalone',
  turbopack: {
    root: __dirname,
  },
  // Removes the `X-Powered-By: Next.js` response header — a minor but
  // free information-disclosure reduction (no reason to tell an attacker
  // the framework for free).
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Clickjacking: this app is never meant to be framed by another
          // origin (no embed/widget use case), so deny it outright rather
          // than allow-list anything.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Stops a browser from guessing a response's MIME type against
          // its declared Content-Type — the standard defense against a
          // handful of MIME-confusion XSS vectors.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Never sends the full referring URL (which can contain
          // exam/attempt ids) to a different origin.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disables browser features this app never uses — each one left
          // enabled by default is one more thing a compromised dependency
          // or injected script could otherwise invoke.
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Only takes effect over HTTPS (browsers ignore it over plain
          // HTTP) — once deployed behind TLS, forces HTTPS for a year and
          // for every subdomain, and opts into browser HSTS-preload lists.
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },
}

export default nextConfig
