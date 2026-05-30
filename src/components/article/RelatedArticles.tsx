import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

interface RelatedArticlesProps {
  articles: ArticleRow[];
  category: CategoryRow | null;
  locale: Locale;
  dict: Dictionary;
}

/**
 * 相关推荐文章组件
 * 展示同版块下的其他文章
 */
export function RelatedArticles({ articles, category, locale, dict }: RelatedArticlesProps) {
  const articleDict = dict.article as Record<string, string>;

  return (
    <section className="mt-10">
      <h2 className="mb-6 text-lg font-semibold text-text-primary">
        {articleDict.relatedArticles}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => {
          const title = locale === 'en' && article.title_en ? article.title_en : article.title;
          const summary = locale === 'en' && article.summary_en ? article.summary_en : article.summary;

          return (
            <Link
              key={article.id}
              href={`/${locale}/article/${article.id}`}
              className="group block"
            >
              <div className="glass card-hover overflow-hidden">
                {article.cover_image && (
                  <div className="h-32 overflow-hidden">
                    <img
                      src={article.cover_image}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-text-primary transition-colors group-hover:text-accent-start">
                    {title}
                  </h3>
                  <p className="line-clamp-2 text-xs text-text-secondary">
                    {summary}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
