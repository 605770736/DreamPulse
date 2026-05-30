/**
 * D1 数据库表结构类型定义
 * 与 SQL Schema 严格对应，使用 snake_case 命名（与数据库列名一致）
 * 用于 D1 查询结果的类型标注
 */

/** 用户表行类型 */
export interface UserRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: 'user' | 'moderator' | 'admin' | 'banned';
  password_hash: string | null;
  locale: string;
  age_verified: number; // SQLite 中用 INTEGER 存储布尔值：0=false, 1=true
  phone: string | null;
  created_at: string;
  updated_at: string;
}

/** OAuth 账户表行类型 */
export interface AccountRow {
  id: string;
  user_id: string;
  type: string;
  provider: string;
  provider_account_id: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

/** 会话表行类型 */
export interface SessionRow {
  id: string;
  user_id: string;
  session_token: string;
  expires: string;
}

/** 验证令牌表行类型 */
export interface VerificationTokenRow {
  identifier: string;
  token: string;
  expires: string;
}

/** 版块表行类型 */
export interface CategoryRow {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  icon: string | null;
  sort_order: number;
  is_adult: number; // 0=false, 1=true
  is_visible: number; // 0=false, 1=true
  created_at: string;
}

/** 文章表行类型 */
export interface ArticleRow {
  id: string;
  title: string;
  title_en: string | null;
  summary: string;
  summary_en: string | null;
  original_url: string;
  original_source: string;
  category_id: string;
  language: string;
  cover_image: string | null;
  status: 'draft' | 'published' | 'archived' | 'rejected';
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** 评论表行类型 */
export interface CommentRow {
  id: string;
  article_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: 'published' | 'hidden' | 'deleted';
  created_at: string;
  updated_at: string;
}

/** 点赞表行类型 */
export interface LikeRow {
  id: string;
  user_id: string;
  target_type: 'article' | 'comment';
  target_id: string;
  created_at: string;
}

/** 收藏表行类型 */
export interface FavoriteRow {
  id: string;
  user_id: string;
  article_id: string;
  created_at: string;
}

/** 关注表行类型 */
export interface FollowRow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

/** 爬取源配置表行类型 */
export interface CrawlSourceRow {
  id: string;
  name: string;
  url: string;
  language: string;
  type: 'rss' | 'api' | 'html';
  category_id: string | null;
  crawl_interval: number;
  last_crawled_at: string | null;
  is_active: number; // 0=false, 1=true
  created_at: string;
}

/** 审核日志表行类型 */
export interface AuditLogRow {
  id: string;
  target_type: 'article' | 'comment' | 'user';
  target_id: string;
  action: 'approve' | 'reject' | 'hide' | 'delete' | 'ban' | 'unban';
  operator_id: string | null;
  reason: string | null;
  created_at: string;
}

/** 年龄验证表行类型 */
export interface AgeVerificationRow {
  id: string;
  user_id: string;
  phone: string;
  code: string;
  is_verified: number; // 0=false, 1=true
  expires_at: string;
  created_at: string;
}

/**
 * D1 环境绑定接口
 * 对应 wrangler.toml 中的绑定配置
 */
export interface D1Env {
  /** D1 数据库绑定 */
  DB: D1Database;
  /** R2 存储桶绑定 */
  R2: R2Bucket;
  /** KV 命名空间绑定 */
  KV: KVNamespace;
}
