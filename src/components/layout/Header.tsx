'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import { useAuthContext } from '@/providers/AuthProvider';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface HeaderProps {
  locale: Locale;
  dict: Dictionary;
}

export function Header({ locale, dict }: HeaderProps) {
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const nav = dict.nav as Record<string, string>;
  const categories = dict.category as Record<string, string>;

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 40);
    addEventListener('scroll', onScroll);
    return () => removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll('[id^="sec-"], #hero');
    const links = document.querySelectorAll('.nav-links a');
    const onScroll = () => {
      let current = '';
      sections.forEach((sec) => {
        const el = sec as HTMLElement;
        if (scrollY >= el.offsetTop - 200) current = sec.id;
      });
      links.forEach((a) => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + current);
      });
    };
    addEventListener('scroll', onScroll);
    return () => removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    const { signOut } = await import('next-auth/react');
    await signOut({ redirectTo: `/${locale}` });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  const sectionLinks = [
    { slug: 'tech', label: categories.tech ?? '科技' },
    { slug: 'society', label: categories.society ?? '社会' },
    { slug: 'emotion', label: categories.emotion ?? '情感' },
    { slug: 'gossip', label: categories.gossip ?? '八卦' },
    { slug: 'media', label: categories.media ?? '音视频' },
    { slug: 'sports', label: categories.sports ?? '体育' },
  ];

  return (
    <nav id="nav" className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <Link href={`/${locale}`} className="nav-brand">
        <span className="pulse-dot" />
        DreamPulse
      </Link>

      <ul className="nav-links">
        {sectionLinks.map((link) => (
          <li key={link.slug}>
            <Link href={`/${locale}/section/${link.slug}`}>{link.label}</Link>
          </li>
        ))}
      </ul>

      <div className="nav-actions">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="btn-glass"
            aria-label={nav.search ?? '搜索'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </button>

          <LanguageSwitcher locale={locale} />

          {isLoading ? null : isAuthenticated && user ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="btn-glass flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-light to-pink-warm flex items-center justify-center text-[10px] font-bold text-white">
                  {(user.name?.[0] ?? 'U').toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-xs">{user.name ?? user.email}</span>
              </button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-48 rounded-[16px] border border-[rgba(255,255,255,0.12)] bg-[rgba(42,21,85,0.95)] backdrop-blur-xl p-1.5 shadow-xl">
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      {locale === 'en' ? 'My Profile' : '个人资料'}
                    </Link>
                    <Link
                      href={`/${locale}/profile#favorites`}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {locale === 'en' ? 'My Favorites' : '我的收藏'}
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href={`/${locale}/admin`}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                        {locale === 'en' ? 'Admin' : '管理后台'}
                      </Link>
                    )}
                    <hr className="my-1 border-[rgba(255,255,255,0.12)]" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      {locale === 'en' ? 'Logout' : '退出登录'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="btn-primary hidden sm:block"
            >
              {nav.login}
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="菜单"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? (
                <path d="M18 6 6 18M6 6l12 12"/>
              ) : (
                <>
                  <path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>
                </>
              )}
            </svg>
          </button>
        </div>

      {searchOpen && (
        <div className="border-t border-[rgba(255,255,255,0.12)] px-4 py-3">
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={nav.search ?? '搜索...'}
              className="w-full px-4 py-2.5 rounded-full border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.07)] text-text-primary placeholder-[rgba(245,243,255,0.32)] outline-none backdrop-blur-md transition-all focus:border-purple-light focus:shadow-[0_0_0_3px_rgba(167,139,250,0.12)]"
              autoFocus
            />
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="border-t border-[rgba(255,255,255,0.12)] px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {sectionLinks.map((link) => (
              <Link
                key={link.slug}
                href={`/${locale}/section/${link.slug}`}
                className="rounded-lg px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoading ? null : isAuthenticated && user ? (
              <>
                <Link
                  href={`/${locale}/profile`}
                  className="mt-2 rounded-lg bg-purple-mid/20 px-3 py-2 text-center text-sm font-medium text-purple-light"
                  onClick={() => setMenuOpen(false)}
                >
                  {user.name ?? user.email}
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg px-3 py-2 text-center text-sm text-red-400 transition-colors hover:bg-red-500/10"
                >
                  {locale === 'en' ? 'Logout' : '退出登录'}
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/login`}
                className="mt-2 rounded-full bg-gradient-to-r from-purple-mid to-pink-warm px-3 py-2 text-center text-sm font-medium text-white"
                onClick={() => setMenuOpen(false)}
              >
                {nav.login}
              </Link>
            )}
          </nav>
        </div>
      )}
    </nav>
  );
}
