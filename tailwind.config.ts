import type { Config } from 'tailwindcss';

/**
 * DreamPulse Tailwind CSS 4 配置
 * 深色科技风主题，品牌「追求梦想」
 */
const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#2a1555',
        'bg-mid': '#1e1040',
        'bg-dark': '#1a0a30',
        'purple-light': '#a78bfa',
        'purple-mid': '#7c3aed',
        'pink-warm': '#f472b6',
        'orange-sunset': '#fb923c',
        'peach': '#fde68a',
        'text-primary': '#f5f3ff',
        'text-secondary': 'rgba(245, 243, 255, 0.7)',
        'glass-bg': 'rgba(255, 255, 255, 0.07)',
        'glass-border': 'rgba(255, 255, 255, 0.12)',
        'cat-tech': '#818cf8',
        'cat-society': '#34d399',
        'cat-emotion': '#f472b6',
        'cat-video': '#fbbf24',
        'cat-sports': '#fb923c',
        'cat-entertainment': '#c084fc',
        // legacy aliases for admin pages
        'dream': {
          'dark': '#2a1555',
          'darker': '#1e1040',
          'card': 'rgba(255, 255, 255, 0.07)',
          'border': 'rgba(255, 255, 255, 0.12)',
        },
        'accent': {
          'start': '#a78bfa',
          'end': '#7c3aed',
          'glow': 'rgba(167, 139, 250, 0.3)',
        },
      },
      borderRadius: {
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'full': '999px',
        'dream': '12px',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
