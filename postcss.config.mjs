/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind CSS 4 使用 @tailwindcss/postcss 替代旧版 tailwindcss 插件
    '@tailwindcss/postcss': {},
  },
};

export default config;
