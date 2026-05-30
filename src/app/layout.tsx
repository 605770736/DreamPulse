import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import './globals.css';

/**
 * 品牌字体配置
 * Inter: 西文字体，现代科技感
 * Noto Sans SC: 中文字体，清晰可读
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sans-sc',
  display: 'swap',
});

/**
 * 站点全局元数据
 */
export const metadata: Metadata = {
  title: {
    default: 'DreamPulse - AI 驱动的新闻聚合平台',
    template: '%s | DreamPulse',
  },
  description:
    'DreamPulse 是一个 AI 驱动的新闻聚合平台，汇集科技、社会、情感、体育等多领域资讯，以智能摘要呈现全球脉搏。',
  keywords: [
    'DreamPulse',
    '新闻聚合',
    'AI 摘要',
    '科技新闻',
    'News Aggregator',
  ],
  authors: [{ name: 'DreamPulse Team' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    alternateLocale: 'en_US',
    siteName: 'DreamPulse',
    title: 'DreamPulse - AI 驱动的新闻聚合平台',
    description:
      '汇集全球脉搏，以 AI 智能摘要呈现深度资讯。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DreamPulse - AI 驱动的新闻聚合平台',
    description:
      '汇集全球脉搏，以 AI 智能摘要呈现深度资讯。',
  },
  robots: {
    index: true,
    follow: true,
  },
};

/**
 * 根布局组件
 * - 深色科技风格主题
 * - 品牌字体注入
 * - 全局 Provider 包裹
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${inter.variable} ${notoSansSC.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-dream-dark text-text-primary antialiased">
        {/* 背景渐变光效 */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-accent-start/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-accent-end/5 blur-[100px]" />
        </div>

        {/* 主内容区域 */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
