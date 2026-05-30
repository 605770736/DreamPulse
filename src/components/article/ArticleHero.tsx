'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ArticleRow } from '@/lib/db/schema';

interface ArticleHeroProps {
  articles: ArticleRow[];
  locale: Locale;
}

/**
 * 头条大图卡片——轮播展示
 * 首页顶部焦点区域
 */
export function ArticleHero({ articles, locale }: ArticleHeroProps) {
  const [current, setCurrent] = useState(0);

  // 自动轮播
  useEffect(() => {
    if (articles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (articles.length === 0) return null;

  const article = articles[current];
  const title = locale === 'en' && article.title_en ? article.title_en : article.title;
  const summary = locale === 'en' && article.summary_en ? article.summary_en : article.summary;

  return (
    <div className="relative overflow-hidden rounded-dream">
      {/* 背景图 */}
      {article.cover_image && (
        <div className="absolute inset-0">
          <img
            src={article.cover_image}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dream-dark via-dream-dark/60 to-transparent" />
        </div>
      )}

      {/* 内容 */}
      <div className="relative z-10 flex min-h-[320px] flex-col justify-end p-6 sm:p-8">
        <Link href={`/${locale}/article/${article.id}`} className="group">
          <h2 className="mb-3 text-2xl font-bold text-white transition-colors sm:text-3xl group-hover:text-accent-start">
            {title}
          </h2>
          <p className="mb-4 line-clamp-2 max-w-2xl text-sm text-white/70 sm:text-base">
            {summary}
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent-start transition-colors group-hover:text-accent-end">
            {locale === 'en' ? 'Read More' : '阅读更多'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        </Link>

        {/* 轮播指示器 */}
        {articles.length > 1 && (
          <div className="mt-4 flex gap-2">
            {articles.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 bg-accent-start'
                    : 'w-3 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`切换到第 ${i + 1} 条`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
