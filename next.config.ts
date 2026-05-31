import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/DreamPulse',
  images: {
    unoptimized: true,
  },
  // 静态导出时忽略 .env 缺失
  env: {},
};

export default nextConfig;
