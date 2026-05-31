'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ArticleRow } from '@/lib/db/schema';

interface ArticleHeroProps {
  articles: ArticleRow[];
  locale: Locale;
}

export function ArticleHero({ articles, locale }: ArticleHeroProps) {
  const [current, setCurrent] = useState(0);

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
    <div className="rounded-[24px] overflow-hidden backdrop-blur-md cursor-pointer transition-all duration-[0.35s] ease-[cubic-bezier(0.4,0,0.2,1)] bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:translate-y-[-5px] hover:shadow-[0_18px_52px_rgba(0,0,0,0.2),0_0_0_1px_rgba(124,58,237,0.2)]">
      {article.cover_image ? (
        <div className="relative h-[300px] overflow-hidden">
          <img
            src={article.cover_image}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,16,64,0.9)] via-[rgba(30,16,64,0.4)] to-transparent" />
        </div>
      ) : (
        <div
          className="h-[300px] flex items-center justify-center text-5xl relative"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.18))' }}
        >
          <span>🌌</span>
        </div>
      )}

      <div className="p-[26px]">
        <div className="relative z-10">
          <Link href={`/${locale}/article/${article.id}`} className="group">
            <h3 className="text-[1.45rem] font-bold leading-[1.3] mb-2.5 transition-colors group-hover:text-purple-light">
              {title}
            </h3>
            <p className="text-text-secondary leading-relaxed mb-4 line-clamp-2">
              {summary}
            </p>
            <div className="flex items-center gap-1.5 text-sm font-medium text-purple-light transition-colors group-hover:text-pink-warm">
              {locale === 'en' ? 'Read More' : '阅读更多'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </Link>

          {articles.length > 1 && (
            <div className="mt-4 flex gap-2">
              {articles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-8 bg-purple-light'
                      : 'w-3 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`切换到第 ${i + 1} 条`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
