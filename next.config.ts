import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 启用 React Server Components
  reactStrictMode: true,

  // 图片优化配置——Cloudflare Pages 不支持 Next.js 默认图片优化
  images: {
    unoptimized: true,
  },

  // Cloudflare Pages 适配：标记所有路由为 Edge Runtime
  experimental: {
    serverComponentsExternalPackages: [],
  },

  // 环境变量暴露到客户端
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

export default nextConfig;
