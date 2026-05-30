import Link from 'next/link';

/**
 * 404 页面
 * 深色科技风格，品牌「追求梦想」元素
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      {/* 脉冲动画背景 */}
      <div className="animate-pulse-glow mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-accent-start to-accent-end">
        <span className="text-5xl font-bold text-white">404</span>
      </div>

      <h1 className="mb-4 text-3xl font-bold text-text-primary">
        页面未找到
      </h1>

      <p className="mb-8 max-w-md text-center text-text-secondary">
        你探索的页面已消散在星尘中。也许它曾存在，也许它只在另一个平行宇宙里。
        让我们回到起点，重新追逐梦想。
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-dream bg-gradient-to-r from-accent-start to-accent-end px-6 py-3 font-medium text-white transition-opacity hover:opacity-90"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        返回首页
      </Link>
    </div>
  );
}
