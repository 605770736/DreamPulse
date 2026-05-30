/**
 * 字典加载器
 * 根据语言代码加载对应的翻译字典
 */

import type { Locale } from './config';
import { DEFAULT_LOCALE, isValidLocale } from './config';

/** 字典类型 — 使用 any 实现深层嵌套属性访问的便利性 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Dictionary = { [key: string]: any };

/**
 * 字典缓存
 * 避免重复加载同一语言的字典文件
 */
const dictionaryCache = new Map<string, Dictionary>();

/**
 * 加载指定语言的翻译字典
 * 使用动态 import 按需加载，减少首屏包体积
 *
 * @param locale - 语言代码
 * @returns 翻译字典对象
 *
 * @example
 * ```ts
 * // 在 Server Component 中
 * const dict = await getDictionary('zh');
 * const title = dict.article.title;
 * ```
 */
export async function getDictionary(locale: unknown): Promise<Dictionary> {
  const safeLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;

  // 检查缓存
  const cached = dictionaryCache.get(safeLocale);
  if (cached) {
    return cached;
  }

  // 动态加载字典文件
  let dictionary: Dictionary;
  try {
    const module = await import(`./dictionaries/${safeLocale}.json`);
    dictionary = module.default as Dictionary;
  } catch {
    // 回退到默认语言
    console.warn(`字典加载失败: ${safeLocale}，回退到默认语言: ${DEFAULT_LOCALE}`);
    const fallbackModule = await import(`./dictionaries/${DEFAULT_LOCALE}.json`);
    dictionary = fallbackModule.default as Dictionary;
  }

  // 写入缓存
  dictionaryCache.set(safeLocale, dictionary);

  return dictionary;
}

/**
 * 从请求头获取当前语言
 * 由中间件设置的 x-locale 请求头
 *
 * @param headers - 请求头对象
 * @returns 语言代码
 *
 * @example
 * ```ts
 * // 在 Server Component 中
 * const headersList = headers();
 * const locale = getLocaleFromHeaders(headersList);
 * const dict = await getDictionary(locale);
 * ```
 */
export function getLocaleFromHeaders(headers: Headers): Locale {
  const locale = headers.get('x-locale');
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * 获取字典中嵌套的值
 * 支持点号路径访问，如 "article.title"
 *
 * @param dict - 字典对象
 * @param path - 点号分隔的路径
 * @param fallback - 找不到时的回退值
 * @returns 对应的翻译文本
 *
 * @example
 * ```ts
 * const dict = await getDictionary('zh');
 * const title = t(dict, 'article.title'); // "文章"
 * const missing = t(dict, 'nonexistent.key', '默认值'); // "默认值"
 * ```
 */
export function t(dict: Dictionary, path: string, fallback?: string): string {
  const keys = path.split('.');
  let current: unknown = dict;

  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return fallback ?? path;
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (typeof current === 'string') {
    return current;
  }

  return fallback ?? path;
}
