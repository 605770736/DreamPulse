import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

interface ArticleCardProps {
  article: ArticleRow;
  category: CategoryRow | null;
  locale: Locale;
}

/**
 * 文章卡片——列表项
 * 展示文章标题、摘要、封面图、互动数据
 */
export function ArticleCard({ article, category, locale }: ArticleCardProps) {
  const title = locale === 'en' && article.title_en ? article.title_en : article.title;
  const summary = locale === 'en' && article.summary_en ? article.summary_en : article.summary;
  const categoryName = category
    ? (locale === 'en' ? category.name_en : category.name)
    : '';

  return (
    <Link href={`/${locale}/article/${article.id}`} className="group block">
      <div className="glass card-hover overflow-hidden">
        {/* 封面图 */}
        {article.cover_image && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={article.cover_image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* 版块标签 */}
            {category && (
              <span className="absolute left-3 top-3 rounded-full bg-accent-start/80 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                {categoryName}
              </span>
            )}
          </div>
        )}

        <div className="p-4">
          {/* 标题 */}
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-text-primary transition-colors group-hover:text-accent-start">
            {title}
          </h3>

          {/* 摘要 */}
          <p className="mb-3 line-clamp-2 text-sm text-text-secondary">
            {summary}
          </p>

          {/* 元信息 */}
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            {category && !article.cover_image && (
              <span className="text-accent-start">{categoryName}</span>
            )}
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
          </div>
        </div>
      </div>
    </Link>
  );
}
