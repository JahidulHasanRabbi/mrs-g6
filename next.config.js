/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/vip-details',
        destination: '/vip',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        // Keep the admin panel ("BackOffice") out of Google's index. The
        // X-Robots-Tag header is the authoritative signal — it applies no
        // matter whether the page is client- or server-rendered, and unlike a
        // robots.txt "Disallow" it actually prevents *indexing* (Disallow only
        // blocks crawling; a disallowed URL can still be indexed if linked).
        // We deliberately keep these routes crawlable so Googlebot can read the
        // noindex directive — a robots.txt block would hide it.
        source: '/admin/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        // Penalty Kick art is content-addressed by filename and only changes
        // when re-exported, so let the browser cache it for a year without
        // revalidation round-trips (those round-trips were a felt delay on
        // slow 4G even when the bitmap was already cached).
        source: '/assets/penalty-kick/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
    ],
  },
}

module.exports = nextConfig
