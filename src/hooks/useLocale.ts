'use client';

/**
 * 语言偏好 Hook
 * 在客户端组件中获取和切换语言偏好
 */

import { useCallback, useEffect, useState } from 'react';
import type { Locale } from '@/lib/i18n/config';
import { LOCALE_COOKIE_NAME, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n/config';

/**
 * 语言偏好 Hook
 * 提供语言切换功能，并将偏好保存到 Cookie
 *
 * @returns 语言偏好和切换函数
 *
 * @example
 * ```tsx
 * const { locale, setLocale, isLoading } = useLocale();
 *
 * <button onClick={() => setLocale('en')}>English</button>
 * <button onClick={() => setLocale('zh')}>中文</button>
 * ```
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从 Cookie 读取语言偏好
  useEffect(() => {
    const cookieValue = getCookie(LOCALE_COOKIE_NAME);
    const detectedLocale = isValidLocale(cookieValue) ? cookieValue : DEFAULT_LOCALE;
    setLocaleState(detectedLocale);
    setIsLoading(false);
  }, []);

  /**
   * 设置语言偏好
   * 同时更新 Cookie 和本地状态
   *
   * @param newLocale - 新的语言代码
   */
  const setLocale = useCallback((newLocale: Locale) => {
    // 设置 Cookie
    document.cookie = `${LOCALE_COOKIE_NAME}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    // 更新本地状态
    setLocaleState(newLocale);
    // 刷新页面以应用新语言（SSR 需要重新渲染）
    window.location.reload();
  }, []);

  return {
    /** 当前语言代码 */
    locale,
    /** 设置语言偏好 */
    setLocale,
    /** 是否加载中 */
    isLoading,
    /** 是否为中文 */
    isZh: locale === 'zh',
    /** 是否为英文 */
    isEn: locale === 'en',
  };
}

/**
 * 从浏览器 Cookie 中读取值
 *
 * @param name - Cookie 名称
 * @returns Cookie 值或空字符串
 */
function getCookie(name: string): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : '';
}
