import type { ArticleRow } from '@/lib/db/schema';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { Badge } from '@/components/ui/Badge';

interface ArticleContentProps {
  article: ArticleRow;
  title: string;
  summary: string;
  categoryName: string;
  categorySlug: string;
  locale: Locale;
  dict: Dictionary;
}

/**
 * 文章内容渲染组件
 * 显示标题、AI摘要标签、摘要正文、原文链接、来源信息
 */
export function ArticleContent({
  article,
  title,
  summary,
  categoryName,
  categorySlug,
  locale,
  dict,
}: ArticleContentProps) {
  const articleDict = dict.article as Record<string, string>;

  return (
    <article className="glass mb-8 p-6 sm:p-8">
      {/* 标题 */}
      <h1 className="mb-4 text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
        {title}
      </h1>

      {/* 元信息行 */}
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
        <a
          href={`/${locale}/section/${categorySlug}`}
          className="rounded-full bg-accent-start/10 px-3 py-0.5 text-xs font-medium text-accent-start transition-colors hover:bg-accent-start/20"
        >
          {categoryName}
        </a>
        {article.published_at && (
          <time dateTime={article.published_at}>
            {new Date(article.published_at).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US')}
          </time>
        )}
        <span>{articleDict.source}: {article.original_source}</span>
      </div>

      {/* AI 摘要标签 */}
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="accent">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1 inline">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          {articleDict.aiSummary}
        </Badge>
      </div>

      {/* 摘要正文 */}
      <div className="prose prose-invert max-w-none">
        <p className="mb-4 text-base leading-relaxed text-text-primary whitespace-pre-wrap">
          {summary}
        </p>
      </div>

      {/* 原文链接 */}
      <div className="mt-6 rounded-dream border border-[var(--color-border)] bg-dream-darker p-4">
        <p className="mb-2 text-sm text-text-secondary">
          {articleDict.viewOriginal}
        </p>
        <a
          href={article.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-accent-start transition-colors hover:text-accent-end"
        >
          {article.original_url}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
        </a>
      </div>

      {/* 互动统计 */}
      <div className="mt-4 flex items-center gap-4 text-sm text-text-secondary">
        <span>{article.view_count} {articleDict.viewCount}</span>
        <span>{article.like_count} {articleDict.likeCount}</span>
        <span>{article.comment_count} {articleDict.commentCount}</span>
      </div>
    </article>
  );
}
