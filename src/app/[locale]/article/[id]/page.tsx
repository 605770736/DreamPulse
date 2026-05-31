import { query, queryOne, execute } from '@/lib/db/client';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { auth } from '@/lib/auth/config';
import { ArticleContent } from '@/components/article/ArticleContent';
import { ActionBar } from '@/components/article/ActionBar';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { CommentSection } from '@/components/article/CommentSection';
import type { ArticleRow, CategoryRow } from '@/lib/db/schema';

/**
 * 文章详情页——AI 摘要、原文链接、互动栏、相关推荐
 */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: localeParam, id } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  // 查询文章详情
  const article = await queryOne<ArticleRow>(
    'SELECT * FROM articles WHERE id = ?',
    id
  );

  if (!article || article.status !== 'published') {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold">{dict.common.noData}</h1>
        <a href={`/${locale}`} className="text-accent-start hover:text-accent-end transition-colors">
          {locale === 'en' ? 'Back to Home' : '返回首页'}
        </a>
      </div>
    );
  }

  // 获取当前登录用户
  const session = await auth();

  // 查询版块信息
  const category = await queryOne<CategoryRow>(
    'SELECT * FROM categories WHERE id = ?',
    article.category_id
  );

  // 异步增加浏览量（不阻塞渲染）
  execute(
    'UPDATE articles SET view_count = view_count + 1 WHERE id = ?',
    id
  ).catch(() => {
    // 浏览量增加失败不影响页面渲染
  });

  // 查询相关文章（同版块下的其他文章）
  const relatedArticles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE category_id = ? AND status = 'published' AND id != ?
     ORDER BY published_at DESC LIMIT 6`,
    article.category_id,
    id
  );

  // 根据语言选择标题和摘要
  const title = locale === 'en' && article.title_en ? article.title_en : article.title;
  const summary = locale === 'en' && article.summary_en ? article.summary_en : article.summary;
  const categoryName = category
    ? (locale === 'en' ? category.name_en : category.name)
    : '';

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* 面包屑导航 */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-text-secondary">
        <a href={`/${locale}`} className="hover:text-accent-start transition-colors">
          {dict.nav.home}
        </a>
        <span>/</span>
        {category && (
          <>
            <a
              href={`/${locale}/section/${category.slug}`}
              className="hover:text-accent-start transition-colors"
            >
              {categoryName}
            </a>
            <span>/</span>
          </>
        )}
        <span className="truncate text-text-primary">{title}</span>
      </nav>

      {/* 文章内容 */}
      <ArticleContent
        article={article}
        title={title}
        summary={summary}
        categoryName={categoryName}
        categorySlug={category?.slug ?? ''}
        locale={locale}
        dict={dict}
      />

      {/* 互动栏 */}
      <ActionBar
        articleId={article.id}
        likeCount={article.like_count}
        commentCount={article.comment_count}
        viewCount={article.view_count}
        locale={locale}
      />

      {/* 相关推荐 */}
      {relatedArticles.length > 0 && (
        <RelatedArticles
          articles={relatedArticles}
          category={category}
          locale={locale}
          dict={dict}
        />
      )}

      {/* 评论区 */}
      <CommentSection
        articleId={id}
        locale={locale}
        currentUserId={session?.user?.id}
      />
    </div>
  );
}
