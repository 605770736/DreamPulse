import { query, queryOne } from '@/lib/db/client';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { ArticleCard } from '@/components/article/ArticleCard';
import { SectionHeader } from '@/components/section/SectionHeader';
import { Pagination } from '@/components/ui/Pagination';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

export async function generateStaticParams() {
  return [{ locale: 'zh', slug: 'tech' }, { locale: 'en', slug: 'tech' }];
}

/**
 * 版块页——按 slug 筛选文章，支持分页
 */
export default async function SectionPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  const page = 1;
  const pageSize = 20;

  // 查询版块信息
  const category = await queryOne<CategoryRow>(
    'SELECT * FROM categories WHERE slug = ?',
    slug
  );

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">{dict.common.noData}</h1>
        <a href={`/${locale}`} className="text-accent-start hover:text-accent-end transition-colors">
          {locale === 'en' ? 'Back to Home' : '返回首页'}
        </a>
      </div>
    );
  }

  // 查询版块下的文章总数
  const countResult = await queryOne<{ total: number }>(
    "SELECT COUNT(*) as total FROM articles WHERE category_id = ? AND status = 'published'",
    category.id
  );
  const total = countResult?.total ?? 0;

  // 查询版块下的文章列表
  const articles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE category_id = ? AND status = 'published'
     ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    category.id,
    pageSize,
    (page - 1) * pageSize
  );

  const sectionTitle = locale === 'en' ? category.name_en : category.name;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <SectionHeader
        title={sectionTitle}
        icon={category.icon ?? undefined}
        locale={locale}
      />

      {articles.length === 0 ? (
        <div className="py-16 text-center text-text-secondary">
          {dict.article.noArticles}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                category={category}
                locale={locale}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                basePath={`/${locale}/section/${slug}`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
