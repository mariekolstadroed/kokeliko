import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  allowedDevOrigins: ['192.168.1.179'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'btqkxmdurcmttsfpgtsw.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
