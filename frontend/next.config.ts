import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Optional: Add API rewrites if needed
  // async rewrites() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
  //     },
  //   ];
  // },
};

export default nextConfig;
