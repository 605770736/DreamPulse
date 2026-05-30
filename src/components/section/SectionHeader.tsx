import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';

interface SectionHeaderProps {
  title: string;
  href?: string;
  icon?: string;
  locale: Locale;
}

/**
 * 版块标题头组件
 * 显示版块名称和"查看更多"链接
 */
export function SectionHeader({ title, href, icon, locale }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary">
        {icon && <span>{icon}</span>}
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-accent-start"
        >
          {locale === 'en' ? 'View All' : '查看全部'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </Link>
      )}
    </div>
  );
}
