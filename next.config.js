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
