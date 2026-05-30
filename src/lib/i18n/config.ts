/**
 * i18n 国际化配置
 * 轻量自实现方案：字典 JSON + Cookie 存储语言偏好
 */

/** 支持的语言列表 */
export const SUPPORTED_LOCALES = ['zh', 'en'] as const;

/** 语言类型 */
export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** 默认语言 */
export const DEFAULT_LOCALE: Locale = 'zh';

/** Cookie 中存储语言偏好的键名 */
export const LOCALE_COOKIE_NAME = 'dreampulse-locale';

/** 请求头中传递语言的键名（由中间件设置） */
export const LOCALE_HEADER_NAME = 'x-locale';

/**
 * 判断给定值是否为有效语言
 *
 * @param locale - 待检验的语言代码
 * @returns 是否为支持的语言
 */
export function isValidLocale(locale: unknown): locale is Locale {
  return typeof locale === 'string' && SUPPORTED_LOCALES.includes(locale as Locale);
}

/**
 * 获取安全的语言值
 * 若给定语言不支持，返回默认语言
 *
 * @param locale - 待检验的语言代码
 * @returns 有效的语言代码
 */
export function getSafeLocale(locale: unknown): Locale {
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}
