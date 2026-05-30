'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import { Button } from '@/components/ui/Button';

interface LoginFormProps {
  dict: Dictionary;
  locale: Locale;
  callbackUrl?: string;
}

/**
 * 登录表单组件
 * 邮箱+密码登录（OAuth 后期按需开启）
 */
export function LoginForm({ dict, locale, callbackUrl }: LoginFormProps) {
  const authDict = dict.auth as Record<string, string>;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // 使用 Auth.js 的 credentials 登录
    const result = await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl ?? `/${locale}`,
    });

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm text-text-secondary">
          {authDict.email}
        </label>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
          placeholder={authDict.email}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-text-secondary">
          {authDict.password}
        </label>
        <input
          name="password"
          type="password"
          required
          className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
          placeholder={authDict.password}
        />
      </div>

      <Button
        type="submit"
        loading={loading}
        className="w-full"
      >
        {authDict.loginButton}
      </Button>

      {/* OAuth 登录按钮已暂时移除，后期按需添加 */}

      <p className="mt-4 text-center text-sm text-text-secondary">
        {authDict.noAccount}{' '}
        <Link
          href={`/${locale}/register`}
          className="text-accent-start hover:text-accent-end transition-colors"
        >
          {authDict.signUpHere}
        </Link>
      </p>
    </form>
  );
}

/** 简单的 signIn 包装（客户端组件中调用 Auth.js） */
async function signIn(provider: string, options?: Record<string, string>) {
  const { signIn: authSignIn } = await import('next-auth/react');
  return authSignIn(provider, options);
}
