'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import type { Locale } from '@/lib/i18n/config';

/** 导航项 */
interface NavItem {
  href: string;
  labelZh: string;
  labelEn: string;
  icon: React.ReactNode;
}

/** 导航配置 */
const NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    labelZh: '仪表盘',
    labelEn: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/articles',
    labelZh: '文章管理',
    labelEn: 'Articles',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    href: '/admin/users',
    labelZh: '用户管理',
    labelEn: 'Users',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    href: '/admin/categories',
    labelZh: '版块管理',
    labelEn: 'Categories',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/admin/audit',
    labelZh: '内容审核',
    labelEn: 'Audit',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4"/><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.48 0 2.88.36 4.11.99"/>
      </svg>
    ),
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}

/**
 * 后台管理布局
 * 左侧导航栏 + 主内容区，需管理员权限
 */
export default function AdminLayout({ children, params }: AdminLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [locale, setLocale] = useState<Locale>('zh');

  // 解析 locale
  params.then((p) => setLocale(p.locale));

  /** 判断导航项是否激活 */
  const isActive = (href: string): boolean => {
    if (href === '/admin') {
      return pathname === `/${locale}/admin`;
    }
    return pathname.startsWith(`/${locale}${href}`);
  };

  return (
    <div className="flex min-h-screen bg-dream-dark">
      {/* 左侧导航栏 */}
      <aside
        className={clsx(
          'sticky top-0 flex h-screen flex-col border-r border-[var(--color-border)] bg-dream-darker transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo 区域 */}
        <div className="flex h-14 items-center border-b border-[var(--color-border)] px-4">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-start to-accent-end text-sm font-bold text-white">
              D
            </div>
            {!sidebarCollapsed && (
              <span className="text-gradient text-sm font-bold">Admin</span>
            )}
          </Link>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                isActive(item.href)
                  ? 'bg-accent-start/10 text-accent-start'
                  : 'text-text-secondary hover:bg-white/5 hover:text-text-primary'
              )}
            >
              {item.icon}
              {!sidebarCollapsed && (
                <span>{locale === 'en' ? item.labelEn : item.labelZh}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* 折叠按钮 */}
        <div className="border-t border-[var(--color-border)] p-3">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={clsx('transition-transform', sidebarCollapsed && 'rotate-180')}
            >
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
