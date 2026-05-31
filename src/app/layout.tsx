import type { Metadata } from 'next';
import { Inter, Noto_Sans_SC } from 'next/font/google';
import { BackgroundEffects } from '@/components/common/BackgroundEffects';
import './globals.css';

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

export const metadata: Metadata = {
  title: {
    default: 'DreamPulse · 追梦脉搏',
    template: '%s | DreamPulse',
  },
  description:
    'DreamPulse 用温暖的方式，为你呈现这个时代最真实的故事。科技有温度，新闻有灵魂。',
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
    title: 'DreamPulse · 追梦脉搏',
    description:
      '捕捉世界的每一次脉动',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DreamPulse · 追梦脉搏',
    description:
      '捕捉世界的每一次脉动',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${inter.variable} ${notoSansSC.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <BackgroundEffects />
        <div className="site-wrapper min-h-screen relative z-[2]">{children}</div>
      </body>
    </html>
  );
}
