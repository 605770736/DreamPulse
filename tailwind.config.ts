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
        // 深色主题品牌色
        'dream': {
          'dark': '#0A0E27',
          'darker': '#000000',
          'card': 'rgba(15, 23, 42, 0.8)',
          'border': 'rgba(148, 163, 184, 0.1)',
        },
        'accent': {
          'start': '#4F46E5',
          'end': '#7C3AED',
          'glow': 'rgba(79, 70, 229, 0.3)',
        },
        // 文本色
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
      },
      borderRadius: {
        'dream': '12px',
      },
      backgroundImage: {
        // 渐变背景
        'gradient-accent': 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))',
        'gradient-glow': 'radial-gradient(circle, var(--color-glow), transparent 70%)',
      },
      fontFamily: {
        // 品牌字体栈
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        // 脉冲动画——品牌「脉搏」元素
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px var(--color-glow)' },
          '100%': { boxShadow: '0 0 20px var(--color-glow), 0 0 40px var(--color-glow)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
