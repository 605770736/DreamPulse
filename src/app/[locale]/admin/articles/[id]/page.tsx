import { getDB } from '@/lib/db/client';
import { apiNotFound } from '@/lib/utils/api';
import type { Locale } from '@/lib/i18n/config';

interface AdminArticleDetailPageProps {
  params: Promise<{ locale: Locale; id: string }>;
}

/**
 * 文章详情/编辑页
 * 查看/编辑文章信息，修改状态，删除
 */
export default async function AdminArticleDetailPage({ params }: AdminArticleDetailPageProps) {
  const { locale, id } = await params;
  const db = await getDB();

  // 查询文章详情
  const article = await db
    .prepare(
      `SELECT a.*, c.name as category_name, c.name_en as category_name_en, c.slug as category_slug
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       WHERE a.id = ?`
    )
    .bind(id)
    .first();

  if (!article) {
    return (
      <div className="py-12 text-center">
        <p className="text-text-secondary">
          {locale === 'en' ? 'Article not found' : '文章不存在'}
        </p>
      </div>
    );
  }

  const a = article as Record<string, unknown>;

  // 状态标签样式
  const statusStyles: Record<string, string> = {
    published: 'bg-green-500/20 text-green-400',
    draft: 'bg-yellow-500/20 text-yellow-400',
    archived: 'bg-gray-500/20 text-gray-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  const categoryName = locale === 'en'
    ? (a.category_name_en as string ?? '')
    : (a.category_name as string ?? '');

  return (
    <div className="space-y-6">
      {/* 返回链接 */}
      <a
        href={`/${locale}/admin/articles`}
        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-start"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {locale === 'en' ? 'Back to Articles' : '返回文章列表'}
      </a>

      {/* 文章信息 */}
      <div className="glass rounded-dream p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">
              {locale === 'en' && a.title_en ? String(a.title_en) : String(a.title ?? '')}
            </h1>
            {Boolean(a.title_en) && locale === 'zh' && (
              <p className="mt-1 text-sm text-text-secondary">{String(a.title_en)}</p>
            )}
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${statusStyles[String(a.status)] ?? ''}`}>
            {String(a.status)}
          </span>
        </div>

        {/* 元信息 */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="text-xs text-text-secondary">
              {locale === 'en' ? 'Category' : '版块'}
            </label>
            <p className="mt-1 text-sm text-text-primary">{categoryName}</p>
          </div>
          <div>
            <label className="text-xs text-text-secondary">
              {locale === 'en' ? 'Source' : '来源'}
            </label>
            <p className="mt-1 text-sm text-text-primary">{String(a.original_source ?? '')}</p>
          </div>
          <div>
            <label className="text-xs text-text-secondary">
              {locale === 'en' ? 'Language' : '语言'}
            </label>
            <p className="mt-1 text-sm text-text-primary">{String(a.language ?? '').toUpperCase()}</p>
          </div>
          <div>
            <label className="text-xs text-text-secondary">
              {locale === 'en' ? 'Created' : '创建时间'}
            </label>
            <p className="mt-1 text-sm text-text-primary">{String(a.created_at ?? '').slice(0, 19)}</p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mb-6 flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-accent-start">{Number(a.view_count ?? 0)}</p>
            <p className="text-xs text-text-secondary">{locale === 'en' ? 'Views' : '浏览'}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-pink-400">{Number(a.like_count ?? 0)}</p>
            <p className="text-xs text-text-secondary">{locale === 'en' ? 'Likes' : '点赞'}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{Number(a.comment_count ?? 0)}</p>
            <p className="text-xs text-text-secondary">{locale === 'en' ? 'Comments' : '评论'}</p>
          </div>
        </div>

        {/* 摘要 */}
        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-text-primary">
              {locale === 'en' ? 'Chinese Summary' : '中文摘要'}
            </h3>
            <p className="rounded-lg bg-dream-darker p-3 text-sm text-text-secondary">
              {String(a.summary ?? '')}
            </p>
          </div>
          {Boolean(a.summary_en) && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-text-primary">
                {locale === 'en' ? 'English Summary' : '英文摘要'}
              </h3>
              <p className="rounded-lg bg-dream-darker p-3 text-sm text-text-secondary">
                {String(a.summary_en)}
              </p>
            </div>
          )}
        </div>

        {/* 原文链接 */}
        <div className="mt-4">
          <a
            href={String(a.original_url ?? '#')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-accent-start hover:underline"
          >
            {locale === 'en' ? 'View Original' : '查看原文'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>
      </div>

      {/* 状态管理表单 */}
      <div className="glass rounded-dream p-6">
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          {locale === 'en' ? 'Status Management' : '状态管理'}
        </h2>
        <form className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              {locale === 'en' ? 'Change Status' : '修改状态'}
            </label>
            <select
              name="status"
              defaultValue={String(a.status ?? '')}
              className="rounded-lg border border-[var(--color-border)] bg-dream-darker px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-start"
            >
              <option value="published">{locale === 'en' ? 'Published' : '已发布'}</option>
              <option value="draft">{locale === 'en' ? 'Draft' : '草稿'}</option>
              <option value="archived">{locale === 'en' ? 'Archived' : '已归档'}</option>
              <option value="rejected">{locale === 'en' ? 'Rejected' : '已拒绝'}</option>
            </select>
          </div>
          <button
            type="submit"
            formAction={async (formData) => {
              'use server';
              const newStatus = formData.get('status') as string;
  const db = await getDB();
              await db
                .prepare("UPDATE articles SET status = ?, updated_at = datetime('now') WHERE id = ?")
                .bind(newStatus, id)
                .run();
              const { revalidatePath } = await import('next/cache');
              revalidatePath(`/${locale}/admin/articles/${id}`);
            }}
            className="rounded-lg bg-gradient-to-r from-accent-start to-accent-end px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {locale === 'en' ? 'Update Status' : '更新状态'}
          </button>
        </form>
      </div>
    </div>
  );
}
