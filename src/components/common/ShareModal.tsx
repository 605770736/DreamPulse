'use client';

import { useState } from 'react';
import type { Locale } from '@/lib/i18n/config';

interface ShareModalProps {
  /** 是否打开 */
  open: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 文章 ID */
  articleId: string;
  /** 当前语言 */
  locale: Locale;
}

/**
 * 分享弹窗组件
 * 包含复制链接、Twitter/微博等社交平台分享按钮
 */
export function ShareModal({ open, onClose, articleId, locale }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dreampulse.app';
  const articleUrl = `${siteUrl}/${locale}/article/${articleId}`;

  /** 复制链接到剪贴板 */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制链接失败:', err);
    }
  };

  /** 分享到 Twitter */
  const shareTwitter = () => {
    const text = locale === 'en' ? 'Check out this article' : '看看这篇文章';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(articleUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  /** 分享到微博 */
  const shareWeibo = () => {
    window.open(
      `https://service.weibo.com/share/share.php?url=${encodeURIComponent(articleUrl)}&title=${encodeURIComponent(locale === 'en' ? 'Check out this article' : '看看这篇文章')}`,
      '_blank',
      'width=600,height=400'
    );
  };

  /** 分享到 Facebook */
  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 弹窗内容 */}
      <div className="relative z-10 w-full max-w-sm rounded-dream border border-[var(--color-border)] bg-dream-dark p-6 shadow-2xl">
        {/* 标题 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">
            {locale === 'en' ? 'Share' : '分享'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* 复制链接 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 rounded-dream border border-[var(--color-border)] bg-dream-darker p-2">
            <input
              type="text"
              value={articleUrl}
              readOnly
              className="flex-1 bg-transparent text-xs text-text-secondary outline-none"
            />
            <button
              onClick={handleCopyLink}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                copied
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gradient-to-r from-accent-start to-accent-end text-white hover:opacity-90'
              }`}
            >
              {copied
                ? (locale === 'en' ? 'Copied!' : '已复制！')
                : (locale === 'en' ? 'Copy' : '复制')
              }
            </button>
          </div>
        </div>

        {/* 社交平台分享按钮 */}
        <div className="grid grid-cols-3 gap-3">
          {/* Twitter */}
          <button
            onClick={shareTwitter}
            className="flex flex-col items-center gap-2 rounded-dream border border-[var(--color-border)] p-3 transition-all hover:border-[#1DA1F2]/50 hover:bg-[#1DA1F2]/5"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#1DA1F2]">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span className="text-xs text-text-secondary">Twitter</span>
          </button>

          {/* 微博 */}
          <button
            onClick={shareWeibo}
            className="flex flex-col items-center gap-2 rounded-dream border border-[var(--color-border)] p-3 transition-all hover:border-[#E6162D]/50 hover:bg-[#E6162D]/5"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#E6162D]">
              <path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zM20.196 9.4a5.007 5.007 0 0 0-4.673-3.199 1.083 1.083 0 1 0 0 2.167 2.844 2.844 0 0 1 2.654 1.818 2.834 2.834 0 0 1-.178 2.245 1.083 1.083 0 1 0 1.934.97 5.007 5.007 0 0 0 .263-4.001zM16.492 2.712c-2.025-.496-4.094-.031-5.67 1.137a1.083 1.083 0 1 0 1.322 1.717 3.824 3.824 0 0 1 3.868-.776 3.812 3.812 0 0 1 2.398 2.947 1.083 1.083 0 1 0 2.141-.342 5.997 5.997 0 0 0-4.059-4.683z"/>
            </svg>
            <span className="text-xs text-text-secondary">微博</span>
          </button>

          {/* Facebook */}
          <button
            onClick={shareFacebook}
            className="flex flex-col items-center gap-2 rounded-dream border border-[var(--color-border)] p-3 transition-all hover:border-[#1877F2]/50 hover:bg-[#1877F2]/5"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#1877F2]">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-xs text-text-secondary">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  );
}
