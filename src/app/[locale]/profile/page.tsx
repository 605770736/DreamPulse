import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="glass mb-8 p-6 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gradient">{dict.profile.title}</h1>
        <p className="text-text-secondary">
          {locale === 'en' ? 'Please log in to view your profile.' : '请登录后查看个人资料。'}
        </p>
        <a
          href={`/${locale}/login`}
          className="mt-4 inline-block rounded-dream bg-gradient-to-r from-accent-start to-accent-end px-6 py-2 text-white"
        >
          {locale === 'en' ? 'Log in' : '登录'}
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href={`/${locale}`}
          className="glass flex items-center gap-3 p-4 transition-colors hover:border-accent-start/30"
        >
          <span className="text-2xl">🏠</span>
          <span className="text-text-primary">{locale === 'en' ? 'Home' : '返回首页'}</span>
        </a>
        <a
          href={`/${locale}/section/tech`}
          className="glass flex items-center gap-3 p-4 transition-colors hover:border-accent-start/30"
        >
          <span className="text-2xl">📰</span>
          <span className="text-text-primary">{locale === 'en' ? 'Browse Articles' : '浏览文章'}</span>
        </a>
        <a
          href={`/${locale}`}
          className="glass flex items-center gap-3 p-4 transition-colors hover:border-accent-start/30"
        >
          <span className="text-2xl">🔙</span>
          <span className="text-text-primary">{locale === 'en' ? 'Back' : '返回上一页'}</span>
        </a>
      </div>
    </div>
  );
}
