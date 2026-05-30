/**
 * DreamPulse 爬虫 Worker 入口
 * 由 Cloudflare Cron Triggers 定时触发
 * 流程：遍历新闻源 → 抓取 → AI 摘要 → 存储 D1
 */

import { NEWS_SOURCES, type NewsSource } from './sources';
import { fetchArticles, type FetchedArticle } from './fetcher';
import { summarizeArticle, type SummarizedArticle } from './ai-summarizer';

/** Worker 环境绑定 */
interface Env {
  DB: D1Database;
  R2: R2Bucket;
  OPENAI_API_KEY: string;
  OPENAI_MODEL: string;
  OPENAI_BASE_URL: string;
  SITE_URL: string;
  FETCH_TIMEOUT: string;
  MAX_ARTICLES_PER_SOURCE: string;
}

export default {
  /**
   * Cron 触发处理函数
   * 遍历所有激活的新闻源，抓取新文章并入库
   */
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[Crawler] 定时任务触发，时间: ${new Date().toISOString()}`);

    const maxArticles = parseInt(env.MAX_ARTICLES_PER_SOURCE ?? '20', 10);
    const timeout = parseInt(env.FETCH_TIMEOUT ?? '15000', 10);

    // 查询需要爬取的新闻源
    const sources = await getActiveSources(env.DB);

    if (sources.length === 0) {
      console.log('[Crawler] 无激活的新闻源，跳过');
      return;
    }

    console.log(`[Crawler] 待爬取源数量: ${sources.length}`);

    let totalCrawled = 0;
    let totalNew = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // 遍历每个源
    for (const source of sources) {
      try {
        console.log(`[Crawler] 开始爬取: ${source.name} (${source.url})`);

        // 1. 抓取新闻
        const articles = await fetchArticles(source, timeout, maxArticles);
        totalCrawled += articles.length;

        // 2. 逐篇处理
        for (const article of articles) {
          try {
            // 2.1 去重：检查 original_url 是否已存在
            const exists = await checkArticleExists(env.DB, article.url);
            if (exists) {
              totalSkipped++;
              continue;
            }

            // 2.2 AI 摘要
            const summarized = await summarizeArticle(
              article,
              env.OPENAI_API_KEY,
              env.OPENAI_MODEL,
              env.OPENAI_BASE_URL
            );

            // 2.3 入库
            await insertArticle(env.DB, summarized, source);
            totalNew++;
          } catch (err) {
            totalErrors++;
            console.error(`[Crawler] 处理文章失败: ${article.url}`, err);
          }
        }

        // 3. 更新源的 last_crawled_at
        await updateSourceCrawledAt(env.DB, source.id);
      } catch (err) {
        totalErrors++;
        console.error(`[Crawler] 爬取源失败: ${source.name}`, err);
      }
    }

    console.log(
      `[Crawler] 爬取完成: 共爬取 ${totalCrawled} 篇, 新增 ${totalNew} 篇, 跳过 ${totalSkipped} 篇, 错误 ${totalErrors} 篇`
    );
  },
};

/**
 * 获取需要爬取的激活新闻源
 * 从 D1 crawl_sources 表查询
 */
async function getActiveSources(db: D1Database): Promise<NewsSource[]> {
  const result = await db
    .prepare(
      `SELECT id, name, url, language, type, category_id, crawl_interval, last_crawled_at
       FROM crawl_sources
       WHERE is_active = 1
         AND (last_crawled_at IS NULL OR datetime(last_crawled_at) < datetime('now', '-' || crawl_interval || ' seconds'))
       ORDER BY last_crawled_at ASC NULLS FIRST`
    )
    .all();

  return (result.results ?? []).map((row) => ({
    id: (row as Record<string, unknown>).id as string,
    name: (row as Record<string, unknown>).name as string,
    url: (row as Record<string, unknown>).url as string,
    language: ((row as Record<string, unknown>).language as string) as 'zh' | 'en',
    type: ((row as Record<string, unknown>).type as string) as 'rss' | 'api' | 'html',
    categoryId: (row as Record<string, unknown>).category_id as string | null,
    crawlInterval: (row as Record<string, unknown>).crawl_interval as number,
    lastCrawledAt: (row as Record<string, unknown>).last_crawled_at as string | null,
    isActive: true,
  }));
}

/**
 * 检查文章是否已存在（按 original_url 去重）
 */
async function checkArticleExists(db: D1Database, originalUrl: string): Promise<boolean> {
  const result = await db
    .prepare('SELECT id FROM articles WHERE original_url = ?')
    .bind(originalUrl)
    .first();
  return result !== null;
}

/**
 * 插入新文章到 D1
 */
async function insertArticle(
  db: D1Database,
  article: SummarizedArticle,
  source: NewsSource
): Promise<void> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO articles (id, title, title_en, summary, summary_en, original_url, original_source, category_id, language, cover_image, status, published_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?, ?)`
    )
    .bind(
      id,
      article.title,
      null,
      article.summaryZh,
      article.summaryEn,
      article.url,
      source.name,
      source.categoryId ?? null,
      source.language,
      article.coverImage ?? null,
      now,
      now,
      now
    )
    .run();
}

/**
 * 更新新闻源的 last_crawled_at 时间戳
 */
async function updateSourceCrawledAt(db: D1Database, sourceId: string): Promise<void> {
  await db
    .prepare("UPDATE crawl_sources SET last_crawled_at = datetime('now') WHERE id = ?")
    .bind(sourceId)
    .run();
}
