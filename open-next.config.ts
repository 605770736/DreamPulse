/**
 * @cloudflare/next-on-pages 配置
 * 用于将 Next.js 构建产物适配到 Cloudflare Pages
 */
const config = {
  // 跳过静态页面生成，使用 Cloudflare Pages 的静态托管
  skipEdgeValidation: true,

  // 自定义路由到 Edge Runtime 的映射
  routeMap: {
    // 所有 API 路由使用 Edge Runtime
    '/api/**': 'edge',
  },
};

export default config;
