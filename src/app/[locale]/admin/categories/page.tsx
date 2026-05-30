import { getDB } from '@/lib/db/client';
import type { Locale } from '@/lib/i18n/config';

interface AdminCategoriesPageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * 版块管理页
 * 版块列表 + 编辑排序 + 新增/编辑弹窗
 */
export default async function AdminCategoriesPage({ params }: AdminCategoriesPageProps) {
  const { locale } = await params;
  const db = getDB();

  // 查询所有版块
  const categories = await db
    .prepare('SELECT * FROM categories ORDER BY sort_order ASC')
    .all();

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">
          {locale === 'en' ? 'Category Management' : '版块管理'}
        </h1>
        <button className="rounded-lg bg-gradient-to-r from-accent-start to-accent-end px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
          {locale === 'en' ? 'Add Category' : '新增版块'}
        </button>
      </div>

      {/* 版块列表 */}
      <div className="glass rounded-dream overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-text-secondary">
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Sort' : '排序'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Icon' : '图标'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Name (ZH)' : '中文名称'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Name (EN)' : '英文名称'}</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Adult' : '成人版块'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Visible' : '可见'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Actions' : '操作'}</th>
              </tr>
            </thead>
            <tbody>
              {(categories.results ?? []).map((row) => {
                const cat = row as Record<string, unknown>;
                return (
                  <tr
                    key={cat.id as string}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-text-secondary">
                      {cat.sort_order as number}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {cat.icon as string ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-text-primary font-medium">
                      {cat.name as string}
                    </td>
                    <td className="px-4 py-3 text-text-primary">
                      {cat.name_en as string}
                    </td>
                    <td className="px-4 py-3">
                      <code className="rounded bg-dream-darker px-2 py-0.5 text-xs text-accent-start">
                        {cat.slug as string}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      {(cat.is_adult as number) === 1 ? (
                        <span className="text-xs text-red-400">🔒</span>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(cat.is_visible as number) === 1 ? (
                        <span className="text-xs text-green-400">✓</span>
                      ) : (
                        <span className="text-xs text-red-400">✗</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-accent-start hover:underline">
                          {locale === 'en' ? 'Edit' : '编辑'}
                        </button>
                        {(cat.slug as string) !== 'adult' && (
                          <button className="text-xs text-red-400 hover:underline">
                            {locale === 'en' ? 'Delete' : '删除'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(categories.results ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-text-secondary">
                    {locale === 'en' ? 'No categories' : '暂无版块'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
