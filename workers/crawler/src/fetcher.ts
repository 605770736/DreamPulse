/**
 * 新闻源抓取器
 * 支持 RSS 解析 + HTML 正文提取
 * 返回结构化的新闻数据
 */

/** 抓取到的原始文章数据 */
export interface FetchedArticle {
  /** 文章标题 */
  title: string;
  /** 文章链接 */
  url: string;
  /** 正文内容（纯文本） */
  content: string;
  /** 发布时间（ISO 8601） */
  publishedAt: string | null;
  /** 封面图 URL */
  coverImage: string | null;
  /** 作者 */
  author: string | null;
}

/** 新闻源配置（与 sources.ts 对应） */
export interface FetcherSource {
  /** 源名称 */
  name: string;
  /** 源 URL */
  url: string;
  /** 源类型 */
  type: 'rss' | 'api' | 'html';
  /** 语言 */
  language: 'zh' | 'en';
  /** 关联版块 ID */
  categoryId: string | null;
}

/**
 * 从新闻源抓取文章列表
 *
 * @param source - 新闻源配置
 * @param timeout - 请求超时（毫秒）
 * @param maxArticles - 单次最大抓取数
 * @returns 抓取到的文章列表
 */
export async function fetchArticles(
  source: FetcherSource,
  timeout: number,
  maxArticles: number
): Promise<FetchedArticle[]> {
  switch (source.type) {
    case 'rss':
      return fetchFromRSS(source.url, timeout, maxArticles);
    case 'html':
      return fetchFromHTML(source.url, timeout, maxArticles);
    case 'api':
      return fetchFromAPI(source.url, timeout, maxArticles);
    default:
      console.warn(`[Fetcher] 未知源类型: ${source.type}`);
      return [];
  }
}

/**
 * 从 RSS 源抓取文章
 * 简单的 XML 解析，提取 <item> 中的标题、链接、描述、发布时间
 */
async function fetchFromRSS(
  url: string,
  timeout: number,
  maxArticles: number
): Promise<FetchedArticle[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DreamPulse-Crawler/1.0',
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      console.error(`[Fetcher] RSS 请求失败: ${response.status} ${url}`);
      return [];
    }

    const xml = await response.text();
    return parseRSS(xml, maxArticles);
  } catch (err) {
    console.error(`[Fetcher] RSS 抓取异常: ${url}`, err);
    return [];
  }
}

/**
 * 解析 RSS XML 文本
 * 支持 RSS 2.0 和 Atom 格式
 */
function parseRSS(xml: string, maxArticles: number): FetchedArticle[] {
  const articles: FetchedArticle[] = [];

  // 提取 RSS 2.0 的 <item>
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const items = xml.match(itemRegex) ?? [];

  for (let i = 0; i < Math.min(items.length, maxArticles); i++) {
    const item = items[i];

    const title = extractTag(item, 'title');
    const link = extractTag(item, 'link');
    const description = extractTag(item, 'description') || extractTag(item, 'content:encoded');
    const pubDate = extractTag(item, 'pubDate') || extractTag(item, 'dc:date');
    const author = extractTag(item, 'author') || extractTag(item, 'dc:creator');

    if (!title || !link) continue;

    // 提取封面图
    const coverImage = extractCoverFromRSS(item) || extractFirstImage(description);

    articles.push({
      title: decodeHTMLEntities(title),
      url: link,
      content: stripHTML(description ?? title),
      publishedAt: pubDate ? parseDate(pubDate) : null,
      coverImage,
      author: author ? decodeHTMLEntities(author) : null,
    });
  }

  // 如果 RSS 2.0 未找到，尝试 Atom 格式
  if (articles.length === 0) {
    const entryRegex = /<entry[\s\S]*?<\/entry>/gi;
    const entries = xml.match(entryRegex) ?? [];

    for (let i = 0; i < Math.min(entries.length, maxArticles); i++) {
      const entry = entries[i];

      const title = extractTag(entry, 'title');
      const link = extractAttr(entry, 'link', 'href');
      const summary = extractTag(entry, 'summary') || extractTag(entry, 'content');
      const updated = extractTag(entry, 'updated') || extractTag(entry, 'published');
      const author = extractTag(entry, 'name');

      if (!title || !link) continue;

      const coverImage = extractFirstImage(summary);

      articles.push({
        title: decodeHTMLEntities(title),
        url: link,
        content: stripHTML(summary ?? title),
        publishedAt: updated ? parseDate(updated) : null,
        coverImage,
        author: author ? decodeHTMLEntities(author) : null,
      });
    }
  }

  return articles;
}

/**
 * 从 HTML 页面抓取文章
 * 提取页面中的文章列表
 */
async function fetchFromHTML(
  url: string,
  timeout: number,
  maxArticles: number
): Promise<FetchedArticle[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DreamPulse-Crawler/1.0',
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      console.error(`[Fetcher] HTML 请求失败: ${response.status} ${url}`);
      return [];
    }

    const html = await response.text();

    // 简单的 HTML 文章提取
    // 提取 <a> 标签中的标题和链接
    const articles: FetchedArticle[] = [];
    const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match: RegExpExecArray | null;

    while ((match = linkRegex.exec(html)) !== null && articles.length < maxArticles) {
      const linkUrl = match[1];
      const linkText = stripHTML(match[2]).trim();

      // 过滤无效链接
      if (!linkUrl || linkUrl === '#' || linkUrl.startsWith('javascript:') || linkText.length < 5) {
        continue;
      }

      // 只保留看起来像文章的链接
      if (linkText.length > 10 && linkText.length < 200) {
        articles.push({
          title: decodeHTMLEntities(linkText),
          url: resolveURL(url, linkUrl),
          content: decodeHTMLEntities(linkText),
          publishedAt: null,
          coverImage: null,
          author: null,
        });
      }
    }

    return articles;
  } catch (err) {
    console.error(`[Fetcher] HTML 抓取异常: ${url}`, err);
    return [];
  }
}

/**
 * 从 API 源抓取文章
 * 假设 API 返回 JSON 格式的文章列表
 */
async function fetchFromAPI(
  url: string,
  timeout: number,
  maxArticles: number
): Promise<FetchedArticle[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DreamPulse-Crawler/1.0',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(timeout),
    });

    if (!response.ok) {
      console.error(`[Fetcher] API 请求失败: ${response.status} ${url}`);
      return [];
    }

    const data = await response.json() as Record<string, unknown>;
    const items = (data.articles ?? data.data ?? data.items ?? []) as Record<string, unknown>[];

    return items.slice(0, maxArticles).map((item) => ({
      title: (item.title ?? item.name ?? '') as string,
      url: (item.url ?? item.link ?? '') as string,
      content: stripHTML((item.content ?? item.description ?? item.summary ?? '') as string),
      publishedAt: parseDate((item.publishedAt ?? item.published_at ?? item.created_at ?? '') as string),
      coverImage: (item.coverImage ?? item.image ?? item.cover_image ?? null) as string | null,
      author: (item.author ?? null) as string | null,
    })).filter((a) => a.title && a.url);
  } catch (err) {
    console.error(`[Fetcher] API 抓取异常: ${url}`, err);
    return [];
  }
}

// ==================== 工具函数 ====================

/** 从 XML 标签中提取文本内容 */
function extractTag(xml: string, tag: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/** 从 XML 标签中提取属性值 */
function extractAttr(xml: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

/** 从 RSS item 中提取封面图 URL */
function extractCoverFromRSS(item: string): string | null {
  // 尝试 <enclosure> 标签
  const enclosureMatch = item.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (enclosureMatch) return enclosureMatch[1];

  // 尝试 <media:content> 标签
  const mediaMatch = item.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
  if (mediaMatch) return mediaMatch[1];

  return null;
}

/** 从 HTML 内容中提取第一张图片 */
function extractFirstImage(html: string | null): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

/** 去除 HTML 标签 */
function stripHTML(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 解码 HTML 实体 */
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&apos;/g, "'");
}

/** 解析日期字符串为 ISO 8601 格式 */
function parseDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

/** 将相对 URL 解析为绝对 URL */
function resolveURL(baseURL: string, relativeURL: string): string {
  try {
    return new URL(relativeURL, baseURL).href;
  } catch {
    return relativeURL;
  }
}
