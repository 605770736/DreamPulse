import { query } from '@/lib/db/client';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { ArticleRow } from '@/lib/db/schema';

interface SidebarProps {
  locale: Locale;
}

export async function Sidebar({ locale }: SidebarProps) {
  const hotArticles = await query<ArticleRow>(
    `SELECT * FROM articles WHERE status = 'published'
     ORDER BY view_count DESC LIMIT 10`
  );

  return (
    <aside className="space-y-6">
      <div className="rounded-[16px] p-4 backdrop-blur-md bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-text-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-light">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
          🔥 {locale === 'en' ? 'Trending' : '热榜'}
        </h3>
        <ul className="space-y-3">
          {hotArticles.map((article, index) => {
            const title = locale === 'en' && article.title_en ? article.title_en : article.title;
            return (
              <li key={article.id}>
                <Link
                  href={`/${locale}/article/${article.id}`}
                  className="group flex items-start gap-2 text-sm"
                >
                  <span className={`shrink-0 text-xs font-bold ${
                    index < 3 ? 'text-purple-light' : 'text-text-secondary'
                  }`}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="line-clamp-2 text-text-secondary transition-colors group-hover:text-text-primary">
                    {title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
