'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';

interface LanguageSwitcherProps {
  locale: Locale;
}

/**
 * 语言切换器
 * 切换中/英文，修改 URL 中的语言段
 */
export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  // 替换 URL 中的语言段
  function getLocalePath(targetLocale: Locale): string {
    const segments = pathname.split('/');
    if (segments.length >= 2) {
      segments[1] = targetLocale;
    }
    return segments.join('/');
  }

  return (
    <div className="flex items-center rounded-lg border border-[var(--color-border)] p-0.5">
      <Link
        href={getLocalePath('zh')}
        className={`rounded-md px-2 py-1 text-xs transition-colors ${
          locale === 'zh'
            ? 'bg-accent-start/20 text-accent-start'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        中
      </Link>
      <Link
        href={getLocalePath('en')}
        className={`rounded-md px-2 py-1 text-xs transition-colors ${
          locale === 'en'
            ? 'bg-accent-start/20 text-accent-start'
            : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        EN
      </Link>
    </div>
  );
}
