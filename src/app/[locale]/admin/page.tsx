import { getDB } from '@/lib/db/client';
import { apiSuccess, handleApiError } from '@/lib/utils/api';
import type { Locale } from '@/lib/i18n/config';

interface AdminPageProps {
  params: Promise<{ locale: Locale }>;
}

/**
 * 后台仪表盘首页
 * 展示 4 张数据卡片 + 最近文章列表 + 最近注册用户
 */
export default async function AdminDashboardPage({ params }: AdminPageProps) {
  const { locale } = await params;
  const db = getDB();

  // 统计数据
  const articleCount = await db
    .prepare('SELECT COUNT(*) as total FROM articles')
    .first();
  const userCount = await db
    .prepare('SELECT COUNT(*) as total FROM users')
    .first();
  const commentCount = await db
    .prepare("SELECT COUNT(*) as total FROM comments WHERE status = 'published'")
    .first();
  const todayNew = await db
    .prepare("SELECT COUNT(*) as total FROM articles WHERE date(created_at) = date('now')")
    .first();

  // 最近文章
  const recentArticles = await db
    .prepare(
      `SELECT a.id, a.title, a.title_en, a.status, a.created_at,
              c.name as category_name
       FROM articles a
       LEFT JOIN categories c ON a.category_id = c.id
       ORDER BY a.created_at DESC LIMIT 5`
    )
    .all();

  // 最近注册用户
  const recentUsers = await db
    .prepare(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC LIMIT 5`
    )
    .all();

  // 统计数字
  const stats = {
    articles: (articleCount as Record<string, number>)?.total ?? 0,
    users: (userCount as Record<string, number>)?.total ?? 0,
    comments: (commentCount as Record<string, number>)?.total ?? 0,
    todayNew: (todayNew as Record<string, number>)?.total ?? 0,
  };

  // 数据卡片配置
  const cards = [
    {
      label: locale === 'en' ? 'Total Articles' : '文章总数',
      value: stats.articles,
      icon: '📄',
      color: 'from-blue-500/20 to-blue-600/10',
      textColor: 'text-blue-400',
    },
    {
      label: locale === 'en' ? 'Total Users' : '用户总数',
      value: stats.users,
      icon: '👥',
      color: 'from-green-500/20 to-green-600/10',
      textColor: 'text-green-400',
    },
    {
      label: locale === 'en' ? 'Total Comments' : '评论总数',
      value: stats.comments,
      icon: '💬',
      color: 'from-purple-500/20 to-purple-600/10',
      textColor: 'text-purple-400',
    },
    {
      label: locale === 'en' ? 'Today New' : '今日新增',
      value: stats.todayNew,
      icon: '🆕',
      color: 'from-orange-500/20 to-orange-600/10',
      textColor: 'text-orange-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <h1 className="text-2xl font-bold text-text-primary">
        {locale === 'en' ? 'Dashboard' : '数据看板'}
      </h1>

      {/* 数据卡片 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`glass rounded-dream bg-gradient-to-br ${card.color} p-5`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-text-secondary">{card.label}</span>
              <span className="text-2xl">{card.icon}</span>
            </div>
            <p className={`text-3xl font-bold ${card.textColor}`}>
              {card.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* 双栏：最近文章 + 最近用户 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 最近文章 */}
        <div className="glass rounded-dream p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {locale === 'en' ? 'Recent Articles' : '最近文章'}
          </h2>
          <div className="space-y-3">
            {(recentArticles.results ?? []).map((row) => {
              const article = row as Record<string, unknown>;
              return (
                <div
                  key={article.id as string}
                  className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-text-primary">
                      {locale === 'en' && article.title_en
                        ? (article.title_en as string)
                        : (article.title as string)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {article.category_name as string} · {article.created_at as string}
                    </p>
                  </div>
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs ${
                      article.status === 'published'
                        ? 'bg-green-500/20 text-green-400'
                        : article.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {(article.status as string)}
                  </span>
                </div>
              );
            })}
            {(recentArticles.results ?? []).length === 0 && (
              <p className="py-4 text-center text-sm text-text-secondary">
                {locale === 'en' ? 'No articles' : '暂无文章'}
              </p>
            )}
          </div>
        </div>

        {/* 最近注册用户 */}
        <div className="glass rounded-dream p-5">
          <h2 className="mb-4 text-base font-semibold text-text-primary">
            {locale === 'en' ? 'Recent Users' : '最近注册用户'}
          </h2>
          <div className="space-y-3">
            {(recentUsers.results ?? []).map((row) => {
              const user = row as Record<string, unknown>;
              return (
                <div
                  key={user.id as string}
                  className="flex items-center justify-between border-b border-[var(--color-border)] pb-3 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-start/20 text-xs font-bold text-accent-start">
                      {(user.name as string)[0]?.toUpperCase() ?? 'U'}
                    </div>
                    <div>
                      <p className="text-sm text-text-primary">{user.name as string}</p>
                      <p className="text-xs text-text-secondary">{user.email as string}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      user.role === 'admin'
                        ? 'bg-accent-start/20 text-accent-start'
                        : user.role === 'moderator'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-white/10 text-text-secondary'
                    }`}
                  >
                    {(user.role as string)}
                  </span>
                </div>
              );
            })}
            {(recentUsers.results ?? []).length === 0 && (
              <p className="py-4 text-center text-sm text-text-secondary">
                {locale === 'en' ? 'No users' : '暂无用户'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
