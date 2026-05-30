import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * 登录页——邮箱 + OAuth 登录
 */
export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { locale: localeParam } = await params;
  const search = await searchParams;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="glass w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gradient">
            {dict.auth.loginTitle}
          </h1>
          <p className="text-text-secondary">{dict.auth.loginSubtitle}</p>
        </div>

        {search.error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {search.error === 'CredentialsSignin'
              ? '邮箱或密码错误'
              : dict.common.error}
          </div>
        )}

        <LoginForm
          dict={dict}
          locale={locale}
          callbackUrl={search.callbackUrl}
        />
      </div>
    </div>
  );
}
