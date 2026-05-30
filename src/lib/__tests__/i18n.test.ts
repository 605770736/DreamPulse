/**
 * i18n 国际化测试
 * 测试 src/lib/i18n/ 中的 config, get-dictionary, t() 函数
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isValidLocale,
  getSafeLocale,
} from '@/lib/i18n/config';
import { t, type Dictionary } from '@/lib/i18n/get-dictionary';

// ==============================
// i18n 配置
// ==============================
describe('i18n config', () => {
  describe('SUPPORTED_LOCALES', () => {
    it('应包含 zh 和 en', () => {
      expect(SUPPORTED_LOCALES).toContain('zh');
      expect(SUPPORTED_LOCALES).toContain('en');
    });

    it('应正好有 2 种语言', () => {
      expect(SUPPORTED_LOCALES).toHaveLength(2);
    });
  });

  describe('DEFAULT_LOCALE', () => {
    it('默认语言应为 zh', () => {
      expect(DEFAULT_LOCALE).toBe('zh');
    });
  });

  describe('isValidLocale', () => {
    it('应返回 true 对支持的语言', () => {
      expect(isValidLocale('zh')).toBe(true);
      expect(isValidLocale('en')).toBe(true);
    });

    it('应返回 false 对不支持的语言', () => {
      expect(isValidLocale('fr')).toBe(false);
      expect(isValidLocale('ja')).toBe(false);
      expect(isValidLocale('de')).toBe(false);
    });

    it('应返回 false 对非字符串值', () => {
      expect(isValidLocale(null)).toBe(false);
      expect(isValidLocale(undefined)).toBe(false);
      expect(isValidLocale(123)).toBe(false);
      expect(isValidLocale({})).toBe(false);
    });

    it('应返回 false 对空字符串', () => {
      expect(isValidLocale('')).toBe(false);
    });
  });

  describe('getSafeLocale', () => {
    it('应返回有效语言本身', () => {
      expect(getSafeLocale('zh')).toBe('zh');
      expect(getSafeLocale('en')).toBe('en');
    });

    it('应回退到默认语言对无效语言', () => {
      expect(getSafeLocale('fr')).toBe('zh');
      expect(getSafeLocale(null)).toBe('zh');
      expect(getSafeLocale(undefined)).toBe('zh');
    });
  });
});

// ==============================
// t() 翻译函数
// ==============================
describe('t() 翻译函数', () => {
  const dict: Dictionary = {
    common: {
      siteName: 'DreamPulse',
      loading: '加载中...',
      noData: '暂无数据',
    },
    nav: {
      home: '首页',
      categories: '版块',
    },
    article: {
      title: '文章',
      nested: {
        deep: '深层嵌套值',
      },
    },
    emptySection: {},
    justString: '直接字符串',
  };

  it('应返回正确的顶层字符串', () => {
    expect(t(dict, 'justString')).toBe('直接字符串');
  });

  it('应返回正确的一级嵌套值', () => {
    expect(t(dict, 'common.siteName')).toBe('DreamPulse');
    expect(t(dict, 'common.loading')).toBe('加载中...');
    expect(t(dict, 'nav.home')).toBe('首页');
  });

  it('应返回正确的深层嵌套值', () => {
    expect(t(dict, 'article.nested.deep')).toBe('深层嵌套值');
  });

  it('应返回 fallback 当路径不存在时', () => {
    expect(t(dict, 'nonexistent.key', '默认值')).toBe('默认值');
  });

  it('应返回路径本身当路径不存在且无 fallback 时', () => {
    expect(t(dict, 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('应返回 fallback 当中间路径不是对象时', () => {
    expect(t(dict, 'justString.something', '回退')).toBe('回退');
  });

  it('应返回 fallback 当路径指向对象而非字符串时', () => {
    expect(t(dict, 'common', '回退')).toBe('回退');
    expect(t(dict, 'emptySection', '回退')).toBe('回退');
    expect(t(dict, 'article.nested', '回退')).toBe('回退');
  });

  it('应返回 fallback 当字典为空对象时', () => {
    expect(t({}, 'any.key', '回退')).toBe('回退');
    expect(t({}, 'any.key')).toBe('any.key');
  });

  it('应处理 null 字典值', () => {
    const dictWithNull: Dictionary = { key: null as unknown as string };
    expect(t(dictWithNull, 'key.sub', '回退')).toBe('回退');
  });
});

// ==============================
// 字典完整性检查
// ==============================
describe('字典完整性', () => {
  it('中文和英文字典应有相同的键结构', async () => {
    const zhModule = await import('@/lib/i18n/dictionaries/zh.json');
    const enModule = await import('@/lib/i18n/dictionaries/en.json');
    const zhDict = zhModule.default as Record<string, unknown>;
    const enDict = enModule.default as Record<string, unknown>;

    // 递归获取所有叶子路径
    function getLeafPaths(obj: Record<string, unknown>, prefix = ''): string[] {
      const paths: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          paths.push(...getLeafPaths(value as Record<string, unknown>, fullKey));
        } else {
          paths.push(fullKey);
        }
      }
      return paths;
    }

    const zhPaths = getLeafPaths(zhDict);
    const enPaths = getLeafPaths(enDict);

    // 检查所有中文键都在英文字典中
    for (const path of zhPaths) {
      expect(enPaths).toContain(path);
    }

    // 检查所有英文键都在中文字典中
    for (const path of enPaths) {
      expect(zhPaths).toContain(path);
    }
  });

  it('中文和英文字典的顶层键应一致', async () => {
    const zhModule = await import('@/lib/i18n/dictionaries/zh.json');
    const enModule = await import('@/lib/i18n/dictionaries/en.json');
    const zhDict = zhModule.default as Record<string, unknown>;
    const enDict = enModule.default as Record<string, unknown>;

    const zhTopKeys = Object.keys(zhDict).sort();
    const enTopKeys = Object.keys(enDict).sort();

    expect(zhTopKeys).toEqual(enTopKeys);
  });
});
