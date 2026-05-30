import { getDB } from '@/lib/db/client';
import type { Locale } from '@/lib/i18n/config';

interface AdminArticlesPageProps {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string; status?: string; search?: string }>;
}

/**
 * 文章管理列表页
 * 表格：标题/版块/状态/创建时间/操作，支持筛选和搜索
 */
export default async function AdminArticlesPage({ params, searchParams }: AdminArticlesPageProps) {
  const { locale } = await params;
  const filters = await searchParams;
  const db = getDB();

  const page = Math.max(1, parseInt(filters.page ?? '1', 10));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const statusFilter = filters.status ?? '';
  const searchFilter = filters.search ?? '';

  // 构建 WHERE 条件
  const conditions: string[] = [];
  const bindParams: unknown[] = [];

  if (statusFilter) {
    conditions.push('a.status = ?');
    bindParams.push(statusFilter);
  }

  if (searchFilter) {
    conditions.push('(a.title LIKE ? OR a.title_en LIKE ?)');
    bindParams.push(`%${searchFilter}%`, `%${searchFilter}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 查询总数
  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM articles a ${whereClause}`)
    .bind(...bindParams)
    .first();
  const total = (countResult as Record<string, number>)?.total ?? 0;

  // 查询文章列表
  const articles = await db
    .prepare(
      `SELECT a.id, a.title, a.title_en, a.status, a.created_at, a.published_at,
              c.name as category_name, c.name_en as category_name_en
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       ${whereClause}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...bindParams, pageSize, offset)
    .all();

  const totalPages = Math.ceil(total / pageSize);

  // 状态标签样式
  const statusStyles: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    archived: 'bg-gray-500/20 text-gray-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="space-y-6">
      {/* 标题 + 操作 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {locale === 'en' ? 'Article Management' : '文章管理'}
        </h1>
      </div>

      {/* 筛选栏 */}
      <div className="glass rounded-dream p-4">
        <form className="flex flex-wrap items-center gap-3">
          {/* 搜索 */}
          <input
            type="text"
            name="search"
            defaultValue={searchFilter}
            placeholder={locale === 'en' ? 'Search articles...' : '搜索文章...'}
            className="w-64 rounded-lg border border-[var(--color-border)] bg-dream-darker px-3 py-2 text-sm text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
          />

          {/* 状态筛选 */}
          <select
            name="status"
            defaultValue={statusFilter}
            className="rounded-lg border border-[var(--color-border)] bg-dream-darker px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-start"
          >
            <option value="">{locale === 'en' ? 'All Status' : '全部状态'}</option>
            <option value="published">{locale === 'en' ? 'Published' : '已发布'}</option>
            <option value="draft">{locale === 'en' ? 'Draft' : '草稿'}</option>
            <option value="archived">{locale === 'en' ? 'Archived' : '已归档'}</option>
            <option value="rejected">{locale === 'en' ? 'Rejected' : '已拒绝'}</option>
          </select>

          {/* 提交按钮 */}
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-accent-start to-accent-end px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {locale === 'en' ? 'Filter' : '筛选'}
          </button>
        </form>
      </div>

      {/* 文章表格 */}
      <div className="glass rounded-dream overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-text-secondary">
                <th className="px-4 py-3 font-medium">
                  {locale === 'en' ? 'Title' : '标题'}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === 'en' ? 'Category' : '版块'}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === 'en' ? 'Status' : '状态'}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === 'en' ? 'Created' : '创建时间'}
                </th>
                <th className="px-4 py-3 font-medium">
                  {locale === 'en' ? 'Actions' : '操作'}
                </th>
              </tr>
            </thead>
            <tbody>
              {(articles.results ?? []).map((row) => {
                const article = row as Record<string, unknown>;
                const title = locale === 'en' && article.title_en
                  ? (article.title_en as string)
                  : (article.title as string);
                const categoryName = locale === 'en'
                  ? (article.category_name_en as string ?? '')
                  : (article.category_name as string ?? '');

                return (
                  <tr
                    key={article.id as string}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="max-w-xs truncate px-4 py-3 text-text-primary">
                      <a
                        href={`/${locale}/admin/articles/${article.id as string}`}
                        className="hover:text-accent-start"
                      >
                        {title}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{categoryName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${statusStyles[article.status as string] ?? ''}`}>
                        {article.status as string}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {(article.created_at as string).slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/${locale}/admin/articles/${article.id as string}`}
                          className="text-xs text-accent-start hover:underline"
                        >
                          {locale === 'en' ? 'Edit' : '编辑'}
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(articles.results ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary">
                    {locale === 'en' ? 'No articles found' : '暂无文章'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页信息 */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
          <span className="text-xs text-text-secondary">
            {locale === 'en'
              ? `Total ${total} articles, page ${page}/${totalPages || 1}`
              : `共 ${total} 篇，第 ${page}/${totalPages || 1} 页`
            }
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}${statusFilter ? `&status=${statusFilter}` : ''}${searchFilter ? `&search=${searchFilter}` : ''}`}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-text-secondary hover:bg-white/5"
              >
                ‹ {locale === 'en' ? 'Prev' : '上一页'}
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}${statusFilter ? `&status=${statusFilter}` : ''}${searchFilter ? `&search=${searchFilter}` : ''}`}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-text-secondary hover:bg-white/5"
              >
                {locale === 'en' ? 'Next' : '下一页'} ›
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
