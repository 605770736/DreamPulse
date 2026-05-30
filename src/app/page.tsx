import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

/**
 * 根页面——根据用户语言偏好重定向到对应语言首页
 * 访问 / 时自动跳转到 /zh 或 /en
 */
export default async function RootPage() {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('dreampulse-locale')?.value;

  const locale = localeCookie === 'en' ? 'en' : 'zh';
  redirect(`/${locale}`);
}
