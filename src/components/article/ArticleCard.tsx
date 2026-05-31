import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

interface ArticleCardProps {
  article: ArticleRow;
  category: CategoryRow | null;
  locale: Locale;
}

const CAT_ICONS: Record<string, string> = {
  tech: '⚡',
  society: '🏙️',
  emotion: '❤️',
  sports: '🏃',
  entertainment: '🎬',
  video: '🎥',
  media: '🎥',
  gossip: '🎬',
};

const CAT_COLORS: Record<string, string> = {
  tech: '#818cf8',
  society: '#34d399',
  emotion: '#f472b6',
  sports: '#fb923c',
  entertainment: '#c084fc',
  video: '#fbbf24',
  media: '#fbbf24',
  gossip: '#c084fc',
};

export function ArticleCard({ article, category, locale }: ArticleCardProps) {
  const title = locale === 'en' && article.title_en ? article.title_en : article.title;
  const summary = locale === 'en' && article.summary_en ? article.summary_en : article.summary;
  const categoryName = category
    ? (locale === 'en' ? category.name_en : category.name)
    : '';
  const slug = category?.slug || '';
  const catColor = CAT_COLORS[slug] || '#a78bfa';
  const catIcon = CAT_ICONS[slug] || '📰';

  return (
    <Link href={`/${locale}/article/${article.id}`} className="group block">
      <div
        className="card-glow rounded-[16px] overflow-hidden backdrop-blur-md cursor-pointer bg-[var(--glass-bg)] border border-[var(--glass-border)]"
        style={{ '--cat-color': catColor } as React.CSSProperties}
      >
        {article.cover_image ? (
          <div className="relative h-[195px] overflow-hidden">
            <img
              src={article.cover_image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
            />
            {category && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-[0.68rem] font-semibold text-white">
                {categoryName}
              </span>
            )}
          </div>
        ) : (
          <div
            className="relative h-[195px] flex items-center justify-center text-5xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-105"
            style={{
              background: `linear-gradient(135deg, ${catColor}44, ${catColor}22)`,
            }}
          >
            <span className="img-placeholder text-5xl">{catIcon}</span>
            {category && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-[0.68rem] font-semibold text-white">
                {categoryName}
              </span>
            )}
          </div>
        )}

        <div
          className="h-[3px] rounded-b-[4px] opacity-70 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, ${catColor}, ${catColor}dd)` }}
        />

        <div className="p-[18px]">
          <h3 className="text-base font-semibold leading-[1.45] mb-[9px] line-clamp-2">
            {title}
          </h3>
          <p className="text-[0.83rem] text-text-secondary leading-[1.65] mb-3.5 line-clamp-3">
            {summary}
          </p>
          <div className="flex items-center justify-between text-[0.75rem]" style={{ color: 'rgba(245,243,255,0.38)' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-[18px] h-[18px] rounded-full bg-gradient-to-br from-purple-light to-pink-warm shrink-0" />
              <span>{categoryName || 'DreamPulse'}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {article.view_count}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                {article.like_count}
              </span>
              <span className="flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                {article.comment_count}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
