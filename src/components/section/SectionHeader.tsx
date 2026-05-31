import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';

interface SectionHeaderProps {
  title: string;
  href?: string;
  icon?: string;
  color?: string;
  locale: Locale;
}

const CAT_COLORS: Record<string, string> = {
  tech: '#818cf8',
  society: '#34d399',
  emotion: '#f472b6',
  sports: '#fb923c',
  entertainment: '#c084fc',
  video: '#fbbf24',
  media: '#fbbf24',
  gossip: '#c084fc',
};

export function SectionHeader({ title, href, icon, color, locale }: SectionHeaderProps) {
  const catColor = color || CAT_COLORS[title.toLowerCase()] || '#a78bfa';

  return (
    <div className="flex items-center justify-between mb-7 pb-3.5 border-b border-[var(--glass-border)]">
      <div className="flex items-center gap-3">
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: catColor, boxShadow: `0 0 10px ${catColor}` }}
        />
        <h3 className="text-[1.3rem] font-bold flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      </div>
      {href && (
        <Link
          href={href}
          className="text-[0.83rem] text-text-secondary hover:text-pink-warm transition-colors flex items-center gap-1"
        >
          {locale === 'en' ? 'View All' : '查看更多'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      )}
    </div>
  );
}
