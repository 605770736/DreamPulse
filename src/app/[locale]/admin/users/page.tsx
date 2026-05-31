import { getDB } from '@/lib/db/client';
import type { Locale } from '@/lib/i18n/config';

interface AdminUsersPageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * 用户管理列表页
 * 表格：用户名/邮箱/角色/状态/注册时间/操作
 */
export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;
  const db = await getDB();

  const page = 1;
  const pageSize = 20;
  const offset = 0;
  const roleFilter = '';
  const searchFilter = '';

  // 查询总数
  const countResult = await db
    .prepare('SELECT COUNT(*) as total FROM users')
    .first();
  const total = (countResult as Record<string, number>)?.total ?? 0;

  // 查询用户列表
  const users = await db
    .prepare(
      `SELECT id, name, email, avatar_url, role, locale, age_verified, created_at
       FROM users
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(pageSize, offset)
    .all();

  const totalPages = Math.ceil(total / pageSize);

  // 角色标签样式
  const roleStyles: Record<string, string> = {
    admin: 'bg-accent-start/20 text-accent-start',
    moderator: 'bg-yellow-500/20 text-yellow-400',
    user: 'bg-white/10 text-text-secondary',
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <h1 className="text-2xl font-bold text-text-primary">
        {locale === 'en' ? 'User Management' : '用户管理'}
      </h1>

      {/* 筛选栏 */}
      <div className="glass rounded-dream p-4">
        <form className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            name="search"
            defaultValue={searchFilter}
            placeholder={locale === 'en' ? 'Search users...' : '搜索用户...'}
            className="w-64 rounded-lg border border-[var(--color-border)] bg-dream-darker px-3 py-2 text-sm text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
          />
          <select
            name="role"
            defaultValue={roleFilter}
            className="rounded-lg border border-[var(--color-border)] bg-dream-darker px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-start"
          >
            <option value="">{locale === 'en' ? 'All Roles' : '全部角色'}</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="user">User</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-accent-start to-accent-end px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {locale === 'en' ? 'Filter' : '筛选'}
          </button>
        </form>
      </div>

      {/* 用户表格 */}
      <div className="glass rounded-dream overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-text-secondary">
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'User' : '用户'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Email' : '邮箱'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Role' : '角色'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Age Verified' : '年龄认证'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Registered' : '注册时间'}</th>
                <th className="px-4 py-3 font-medium">{locale === 'en' ? 'Actions' : '操作'}</th>
              </tr>
            </thead>
            <tbody>
              {(users.results ?? []).map((row) => {
                const user = row as Record<string, unknown>;
                return (
                  <tr
                    key={user.id as string}
                    className="border-b border-[var(--color-border)] transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-start/20 text-xs font-bold text-accent-start">
                          {(user.name as string)[0]?.toUpperCase() ?? 'U'}
                        </div>
                        <span className="text-text-primary">{user.name as string}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary">{user.email as string}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${roleStyles[user.role as string] ?? ''}`}>
                        {user.role as string}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(user.age_verified as number) === 1 ? (
                        <span className="text-xs text-green-400">✓</span>
                      ) : (
                        <span className="text-xs text-text-secondary">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-secondary">
                      {(user.created_at as string).slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-secondary">
                        {locale === 'en' ? 'View-only' : '只读'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {(users.results ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-text-secondary">
                    {locale === 'en' ? 'No users found' : '暂无用户'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
          <span className="text-xs text-text-secondary">
            {locale === 'en'
              ? `Total ${total} users, page ${page}/${totalPages || 1}`
              : `共 ${total} 个用户，第 ${page}/${totalPages || 1} 页`
            }
          </span>
          <div className="flex items-center gap-2">
            {page > 1 && (
              <a
                href={`?page=${page - 1}${roleFilter ? `&role=${roleFilter}` : ''}${searchFilter ? `&search=${searchFilter}` : ''}`}
                className="rounded-lg border border-[var(--color-border)] px-3 py-1 text-xs text-text-secondary hover:bg-white/5"
              >
                ‹ {locale === 'en' ? 'Prev' : '上一页'}
              </a>
            )}
            {page < totalPages && (
              <a
                href={`?page=${page + 1}${roleFilter ? `&role=${roleFilter}` : ''}${searchFilter ? `&search=${searchFilter}` : ''}`}
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
