import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';

interface FooterProps {
  locale: Locale;
  dict: Dictionary;
}

export function Footer({ locale, dict }: FooterProps) {
  const footer = dict.footer as Record<string, string>;
  const nav = dict.nav as Record<string, string>;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href={`/${locale}`} className="nav-brand" style={{ fontSize: '1.2rem' }}>
            <span className="pulse-dot" />
            DreamPulse
          </Link>
          <p>{footer.aboutDescription}</p>
        </div>

        <div className="footer-col">
          <h4>{locale === 'en' ? 'Sections' : '栏目'}</h4>
          <ul>
            <li><Link href={`/${locale}/section/tech`}>科技</Link></li>
            <li><Link href={`/${locale}/section/society`}>社会</Link></li>
            <li><Link href={`/${locale}/section/emotion`}>情感</Link></li>
            <li><Link href={`/${locale}/section/sports`}>体育</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{locale === 'en' ? 'About' : '关于'}</h4>
          <ul>
            <li><Link href={`/${locale}`}>{nav.home}</Link></li>
            <li><Link href={`/${locale}/profile`}>{locale === 'en' ? 'Profile' : '个人中心'}</Link></li>
            <li><Link href={`/${locale}/login`}>{nav.login}</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{locale === 'en' ? 'Follow Us' : '关注我们'}</h4>
          <a href="https://github.com/605770736/DreamPulse" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', height: 32, width: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>{footer.copyright}</span>
        <span>追梦脉搏 · 温暖呈现</span>
      </div>
    </footer>
  );
}
