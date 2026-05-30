/**
 * 新闻源配置列表
 * 定义中英文新闻源，每个源包含名称、URL、类型、语言、版块
 */

/** 新闻源配置 */
export interface NewsSource {
  /** 源 ID（与 D1 数据库 crawl_sources.id 对应） */
  id: string;
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
  /** 爬取间隔（秒） */
  crawlInterval: number;
  /** 最后爬取时间 */
  lastCrawledAt: string | null;
  /** 是否激活 */
  isActive: boolean;
}

/**
 * 预设新闻源列表
 * 这些源会在数据库初始化时写入 crawl_sources 表
 * 注意：这些是示例源，实际使用时需替换为真实可用的 RSS/API 地址
 */
export const NEWS_SOURCES: Omit<NewsSource, 'lastCrawledAt'>[] = [
  // ========== 中文源 ==========
  // 科技
  {
    id: 'src_36kr',
    name: '36氪',
    url: 'https://36kr.com/feed',
    type: 'rss',
    language: 'zh',
    categoryId: 'cat_tech',
    crawlInterval: 1800,
    isActive: true,
  },
  {
    id: 'src_huxiu',
    name: '虎嗅',
    url: 'https://www.huxiu.com/rss/0.xml',
    type: 'rss',
    language: 'zh',
    categoryId: 'cat_tech',
    crawlInterval: 1800,
    isActive: true,
  },
  {
    id: 'src_ithome',
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
    type: 'rss',
    language: 'zh',
    categoryId: 'cat_tech',
    crawlInterval: 1800,
    isActive: true,
  },
  // 社会
  {
    id: 'src_thepaper',
    name: '澎湃新闻',
    url: 'https://cache.thepaper.cn/contentapi/wwwIndex/rightSidebar',
    type: 'api',
    language: 'zh',
    categoryId: 'cat_society',
    crawlInterval: 1800,
    isActive: true,
  },
  // 体育
  {
    id: 'src_sports_sina',
    name: '新浪体育',
    url: 'https://sports.sina.com.cn/rss/sports.xml',
    type: 'rss',
    language: 'zh',
    categoryId: 'cat_sports',
    crawlInterval: 3600,
    isActive: true,
  },
  // 明星八卦
  {
    id: 'src_ent_sina',
    name: '新浪娱乐',
    url: 'https://ent.sina.com.cn/rss/feed.xml',
    type: 'rss',
    language: 'zh',
    categoryId: 'cat_gossip',
    crawlInterval: 3600,
    isActive: true,
  },

  // ========== 英文源 ==========
  // Technology
  {
    id: 'src_techcrunch',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_tech',
    crawlInterval: 1800,
    isActive: true,
  },
  {
    id: 'src_theverge',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_tech',
    crawlInterval: 1800,
    isActive: true,
  },
  {
    id: 'src_arstechnica',
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_tech',
    crawlInterval: 3600,
    isActive: true,
  },
  // Society
  {
    id: 'src_bbc',
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/rss.xml',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_society',
    crawlInterval: 1800,
    isActive: true,
  },
  {
    id: 'src_guardian',
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_society',
    crawlInterval: 3600,
    isActive: true,
  },
  // Sports
  {
    id: 'src_espn',
    name: 'ESPN',
    url: 'https://www.espn.com/espn/rss/news',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_sports',
    crawlInterval: 3600,
    isActive: true,
  },
  // Emotion / Lifestyle
  {
    id: 'src_huffpost',
    name: 'HuffPost',
    url: 'https://www.huffpost.com/rss/index.xml',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_emotion',
    crawlInterval: 3600,
    isActive: true,
  },
  // Media
  {
    id: 'src_wired',
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    type: 'rss',
    language: 'en',
    categoryId: 'cat_media',
    crawlInterval: 3600,
    isActive: true,
  },
];
