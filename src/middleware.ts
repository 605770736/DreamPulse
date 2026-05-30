import { NextRequest, NextResponse } from 'next/server';

/**
 * DreamPulse 中间件
 * 功能：
 * 1. 语言检测——读取 Cookie 中的 locale，若无则检测 Accept-Language，设置 x-locale 请求头
 * 2. 成人版块拦截——当前成人版块暂未开放，直接重定向到首页（后期按需开启年龄认证）
 */

/** 支持的语言列表 */
const SUPPORTED_LOCALES = ['zh', 'en'];

/** 默认语言 */
const DEFAULT_LOCALE = 'zh';

/** Cookie 中存储语言偏好的键名 */
const LOCALE_COOKIE_NAME = 'dreampulse-locale';

/** 需要年龄认证的路径前缀 */
const ADULT_PATH_PREFIX = '/section/adult';

/**
 * 从 Accept-Language 头检测用户偏好语言
 * 优先匹配支持的语言，其次回退到默认语言
 */
function detectLocaleFromHeader(acceptLanguage: string | null): string {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  // 解析 Accept-Language 头，按优先级排序
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, priority] = lang.trim().split(';q=');
      return {
        code: code.toLowerCase().split('-')[0], // 提取主语言代码，如 zh-CN → zh
        priority: priority ? parseFloat(priority) : 1.0,
      };
    })
    .sort((a, b) => b.priority - a.priority);

  // 匹配支持的语言
  for (const lang of languages) {
    if (SUPPORTED_LOCALES.includes(lang.code)) {
      return lang.code;
    }
  }

  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========================================
  // 1. 语言检测与设置
  // ========================================
  const localeCookie = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const locale = localeCookie && SUPPORTED_LOCALES.includes(localeCookie)
    ? localeCookie
    : detectLocaleFromHeader(request.headers.get('accept-language'));

  // ========================================
  // 2. 成人版块拦截（暂未开放，后期开启年龄认证）
  // ========================================
  if (pathname === ADULT_PATH_PREFIX || pathname.startsWith(ADULT_PATH_PREFIX + '/')) {
    // 成人版块暂未开放，重定向到首页
    const homeUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(homeUrl);
  }

  // ========================================
  // 3. 构建响应，注入 x-locale 请求头
  // ========================================
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);

  // 如果 Cookie 中没有语言偏好，设置默认值
  if (!localeCookie) {
    response.cookies.set(LOCALE_COOKIE_NAME, locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 年有效期
      sameSite: 'lax',
      httpOnly: false, // 允许客户端读取
    });
  }

  return response;
}

/**
 * 中间件匹配规则
 * 排除静态资源、API 路由（除 age-verify 外）、_next 内部路径
 */
export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - _next/static（静态资源）
     * - _next/image（图片优化）
     * - favicon.ico
     * - public 目录下的文件
     * - api/auth（Auth.js 路由）
     */
    '/((?!_next/static|_next/image|favicon\\.ico|images/|api/auth).*)',
  ],
};
