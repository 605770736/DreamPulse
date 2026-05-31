import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import Link from 'next/link';

/**
 * 注册页——邮箱 + OAuth 注册
 */
export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="glass w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gradient">
            {dict.auth.registerTitle}
          </h1>
          <p className="text-text-secondary">{dict.auth.registerSubtitle}</p>
        </div>

        {/* 注册表单 */}
        <form
          action="/api/auth/register"
          method="POST"
          className="space-y-4"
        >
          <input type="hidden" name="locale" value={locale} />
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              {dict.auth.name}
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
              placeholder={dict.auth.name}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              {dict.auth.email}
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
              placeholder={dict.auth.email}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-text-secondary">
              {dict.auth.password}
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
              placeholder={dict.auth.password}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-dream bg-gradient-to-r from-accent-start to-accent-end px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            {dict.auth.registerButton}
          </button>
        </form>

        {/* OAuth 注册按钮已暂时移除，后期按需添加 */}

        <p className="mt-6 text-center text-sm text-text-secondary">
          {dict.auth.hasAccount}{' '}
          <Link
            href={`/${locale}/login`}
            className="text-accent-start hover:text-accent-end transition-colors"
          >
            {dict.auth.signInHere}
          </Link>
        </p>
      </div>
    </div>
  );
}
