import { getDictionary } from '@/lib/i18n/get-dictionary';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';

/**
 * 个人资料页
 * 需要登录后才能访问
 */
export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);

  const session = await auth();
  if (!session?.user) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/profile`);
  }

  const user = session.user;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-gradient">
        {dict.profile.title}
      </h1>

      {/* 用户资料卡 */}
      <div className="glass mb-8 p-6">
        <div className="flex items-center gap-6">
          {/* 头像 */}
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-accent-start to-accent-end">
            {user.image ? (
              <img src={user.image} alt={user.name ?? ''} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                {(user.name ?? 'U')[0].toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{user.name}</h2>
            <p className="text-text-secondary">{user.email}</p>
          </div>
        </div>

        {/* 资料信息 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-text-secondary">{dict.profile.name}</label>
            <p className="mt-1 text-text-primary">{user.name}</p>
          </div>
          <div>
            <label className="text-sm text-text-secondary">{dict.profile.email}</label>
            <p className="mt-1 text-text-primary">{user.email}</p>
          </div>
          <div>
            <label className="text-sm text-text-secondary">{dict.profile.language}</label>
            <p className="mt-1 text-text-primary">
              {locale === 'zh' ? '中文' : 'English'}
            </p>
          </div>
          <div>
            <label className="text-sm text-text-secondary">{dict.profile.ageVerified}</label>
            <p className="mt-1">
              {(user as unknown as Record<string, unknown>).ageVerified ? (
                <span className="text-green-400">✓ {dict.profile.ageVerified}</span>
              ) : (
                <a
                  href={`/${locale}/age-verify`}
                  className="text-accent-start hover:text-accent-end transition-colors"
                >
                  {dict.profile.verifyNow}
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div className="grid gap-4 sm:grid-cols-3">
        <a
          href="#favorites"
          className="glass flex items-center gap-3 p-4 transition-colors hover:border-accent-start/30"
        >
          <span className="text-2xl">⭐</span>
          <span className="text-text-primary">{dict.profile.myFavorites}</span>
        </a>
        <a
          href="#comments"
          className="glass flex items-center gap-3 p-4 transition-colors hover:border-accent-start/30"
        >
          <span className="text-2xl">💬</span>
          <span className="text-text-primary">{dict.profile.myComments}</span>
        </a>
        <a
          href="#follows"
          className="glass flex items-center gap-3 p-4 transition-colors hover:border-accent-start/30"
        >
          <span className="text-2xl">👥</span>
          <span className="text-text-primary">{dict.profile.myFollows}</span>
        </a>
      </div>
    </div>
  );
}
