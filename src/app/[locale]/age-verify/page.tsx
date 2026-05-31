'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidLocale, DEFAULT_LOCALE } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/get-dictionary';
import type { ApiResponse } from '@/types/api';

/**
 * 年龄认证页——手机号短信验证码认证
 * 客户端组件，处理发送验证码和验证逻辑
 */
export default function AgeVerifyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const router = useRouter();
  const callbackUrl = '/';

  // 使用 useState 管理语言（客户端组件无法 await params）
  const [locale] = useState<'zh' | 'en'>(() => {
    // 从 URL 中提取语言
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const loc = pathParts[1];
      return isValidLocale(loc) ? loc : DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  });

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /** 发送验证码 */
  async function handleSendCode() {
    if (!phone) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/age-verify/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json() as ApiResponse<{ verified?: boolean }>;

      if (data.code === 0) {
        setStep('code');
        setCountdown(300);
        // 倒计时
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message);
      }
    } catch {
      setError(locale === 'zh' ? '发送失败，请重试' : 'Failed to send, please retry');
    } finally {
      setLoading(false);
    }
  }

  /** 验证年龄 */
  async function handleVerify() {
    if (!phone || !code) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/age-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json() as ApiResponse<{ verified?: boolean }>;

      if (data.code === 0 && data.data?.verified) {
        // 设置年龄认证 Cookie
        document.cookie = 'dreampulse-age-verified=true;path=/;max-age=31536000;samesite=lax';
        // 跳转回原页面
        router.push(callbackUrl);
      } else {
        setError(data.message ?? (locale === 'zh' ? '验证失败' : 'Verification failed'));
      }
    } catch {
      setError(locale === 'zh' ? '验证失败，请重试' : 'Verification failed, please retry');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="glass w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-start to-accent-end">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-text-primary">
            {locale === 'zh' ? '年龄认证' : 'Age Verification'}
          </h1>
          <p className="text-text-secondary">
            {locale === 'zh' ? '访问成人内容需要先进行年龄认证' : 'To access adult content, please verify your age'}
          </p>
        </div>

        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-text-secondary hover:text-accent-start transition-colors"
          >
            ← {locale === 'en' ? 'Back' : '返回'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {step === 'phone' ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                {locale === 'zh' ? '手机号码' : 'Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+8613800138000"
                className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
              />
            </div>
            <button
              onClick={handleSendCode}
              disabled={loading || !phone}
              className="w-full rounded-dream bg-gradient-to-r from-accent-start to-accent-end px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? (locale === 'zh' ? '发送中...' : 'Sending...')
                : (locale === 'zh' ? '发送验证码' : 'Send Code')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm text-text-secondary">
                {locale === 'zh' ? '验证码' : 'Verification Code'}
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={locale === 'zh' ? '6位数字验证码' : '6-digit code'}
                maxLength={6}
                className="w-full rounded-dream border border-[var(--color-border)] bg-dream-darker px-4 py-2.5 text-text-primary placeholder-text-secondary outline-none focus:border-accent-start"
              />
            </div>
            <button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="w-full rounded-dream bg-gradient-to-r from-accent-start to-accent-end px-4 py-2.5 font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading
                ? (locale === 'zh' ? '验证中...' : 'Verifying...')
                : (locale === 'zh' ? '验证' : 'Verify')}
            </button>
            <button
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="w-full rounded-dream border border-[var(--color-border)] px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              {countdown > 0
                ? (locale === 'zh' ? `${countdown}秒后重新发送` : `Resend in ${countdown}s`)
                : (locale === 'zh' ? '重新发送验证码' : 'Resend code')}
            </button>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-text-secondary">
          {locale === 'zh' ? '验证成功后将跳转到您请求的页面' : 'You will be redirected after verification'}
        </p>
      </div>
    </div>
  );
}
