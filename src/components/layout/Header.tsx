'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

/**
 * 顶部导航栏
 * Logo、版块菜单、搜索框、语言切换、用户菜单
 */
export function Header({ locale, dict }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const nav = dict.nav as Record<string, string>;
  const categories = dict.category as Record<string, string>;

  // 版块导航链接
  const sectionLinks = [
    { slug: 'tech', label: categories.tech ?? '科技' },
    { slug: 'society', label: categories.society ?? '社会' },
    { slug: 'emotion', label: categories.emotion ?? '情感' },
    { slug: 'gossip', label: categories.gossip ?? '八卦' },
    { slug: 'media', label: categories.media ?? '音视频' },
    { slug: 'sports', label: categories.sports ?? '体育' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-dream-dark/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          {/* 脉冲图标 */}
          <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
            <defs>
              <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4F46E5"/>
                <stop offset="100%" stopColor="#7C3AED"/>
              </linearGradient>
            </defs>
            <path d="M3 16 Q8 6 16 16 Q24 26 29 16" stroke="url(#headerGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            <circle cx="16" cy="16" r="3" fill="url(#headerGrad)"/>
          </svg>
          <span className="text-lg font-bold">
            <span className="text-text-primary">Dream</span>
            <span className="text-gradient">Pulse</span>
          </span>
        </Link>

        {/* 桌面版块导航 */}
        <nav className="hidden items-center gap-1 md:flex">
          {sectionLinks.map((link) => (
            <Link
              key={link.slug}
              href={`/${locale}/section/${link.slug}`}
              className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* 右侧工具栏 */}
        <div className="flex items-center gap-2">
          {/* 搜索按钮 */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
            aria-label={nav.search ?? '搜索'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>

          {/* 语言切换 */}
          <LanguageSwitcher locale={locale} />

          {/* 用户菜单 */}
          <Link
            href={`/${locale}/login`}
            className="hidden rounded-lg bg-gradient-to-r from-accent-start to-accent-end px-4 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:block"
          >
            {nav.login}
          </Link>

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 md:hidden"
            aria-label="菜单"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <path d="M18 6 6 18M6 6l12 12"/>
              ) : (
                <>
                  <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      {searchOpen && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <div className="mx-auto max-w-2xl">
            <input
              type="search"
              placeholder={nav.search ?? '搜索...'}
              className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* 移动端导航菜单 */}
      {menuOpen && (
        <div className="border-t border-[var(--color-border)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {sectionLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/${locale}/section/${link.slug}`}
                className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/login`}
              className="mt-2 rounded-lg bg-gradient-to-r from-accent-start to-accent-end px-3 py-2 text-center text-sm font-medium text-white"
              onClick={() => setMenuOpen(false)}
            >
              {nav.login}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
