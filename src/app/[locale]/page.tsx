import { query } from '@/lib/db/client';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { ArticleHero } from '@/components/article/ArticleHero';
import { ArticleCard } from '@/components/article/ArticleCard';
import { Sidebar } from '@/components/layout/Sidebar';
import { SectionHeader } from '@/components/section/SectionHeader';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

/**
 * 首页——头条轮播、快讯滚动、各版块卡片列表、热榜侧边栏
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  // 查询可见版块
  const categories = await query<CategoryRow>(
    'SELECT * FROM categories WHERE is_visible = 1 ORDER BY sort_order ASC'
  );

  // 查询头条文章（浏览量最高的已发布文章）
  const heroArticles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE status = 'published' AND cover_image IS NOT NULL
     ORDER BY view_count DESC, published_at DESC LIMIT 5`
  );

  // 查询最新文章
  const latestArticles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE status = 'published'
     ORDER BY published_at DESC LIMIT 20`
  );

  // 按版块分组文章
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const articlesByCategory = categories
    .filter((c) => !c.is_adult)
    .map((category) => {
      const articles = latestArticles.filter(
        (a) => a.category_id === category.id
      );
      return { category, articles };
    })
    .filter((group) => group.articles.length > 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* 头条轮播 */}
      {heroArticles.length > 0 && (
        <section className="mb-8">
          <ArticleHero articles={heroArticles} locale={locale} />
        </section>
      )}

      <div className="flex gap-8">
        {/* 主内容区 */}
        <div className="flex-1 min-w-0">
          {/* 最新资讯 */}
          <section className="mb-10">
            <SectionHeader
              title={dict.article.latestNews}
              locale={locale}
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latestArticles.slice(0, 6).map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  category={categoryMap.get(article.category_id) ?? null}
                  locale={locale}
                />
              ))}
            </div>
          </section>

          {/* 各版块文章 */}
          {articlesByCategory.map(({ category, articles }) => (
            <section key={category.id} className="mb-10">
              <SectionHeader
                title={locale === 'en' ? category.name_en : category.name}
                href={`/${locale}/section/${category.slug}`}
                locale={locale}
              />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 3).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    category={category}
                    locale={locale}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* 侧边栏 */}
        <aside className="hidden w-80 shrink-0 lg:block">
          <Sidebar locale={locale} />
        </aside>
      </div>
    </div>
  );
}
