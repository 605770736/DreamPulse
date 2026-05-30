-- ==============================
-- DreamPulse D1 初始化建表脚本
-- 版本: 0001
-- 日期: 2026-05-30
-- ==============================

-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'moderator', 'admin', 'banned')),
  locale TEXT DEFAULT 'en',
  age_verified INTEGER DEFAULT 0,
  phone TEXT,
  password_hash TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- OAuth 账户表（Auth.js）
CREATE TABLE accounts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  UNIQUE(provider, provider_account_id)
);

-- 会话表（Auth.js）
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires TEXT NOT NULL
);

-- 验证令牌表（Auth.js）
CREATE TABLE verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires TEXT NOT NULL
);

-- 版块表
CREATE TABLE categories (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_adult INTEGER DEFAULT 0,
  is_visible INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 文章表
CREATE TABLE articles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  title TEXT NOT NULL,
  title_en TEXT,
  summary TEXT NOT NULL,
  summary_en TEXT,
  original_url TEXT NOT NULL,
  original_source TEXT NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  language TEXT DEFAULT 'zh',
  cover_image TEXT,
  status TEXT DEFAULT 'published' CHECK(status IN ('draft', 'published', 'archived', 'rejected')),
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 评论表
CREATE TABLE comments (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  parent_id TEXT REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'published' CHECK(status IN ('published', 'hidden', 'deleted')),
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 点赞表
CREATE TABLE likes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  target_type TEXT NOT NULL CHECK(target_type IN ('article', 'comment')),
  target_id TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, target_type, target_id)
);

-- 收藏表
CREATE TABLE favorites (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(user_id, article_id)
);

-- 关注表
CREATE TABLE follows (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  follower_id TEXT NOT NULL REFERENCES users(id),
  following_id TEXT NOT NULL REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(follower_id, following_id)
);

-- 爬取源配置表
CREATE TABLE crawl_sources (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  language TEXT DEFAULT 'zh',
  type TEXT DEFAULT 'rss' CHECK(type IN ('rss', 'api', 'html')),
  category_id TEXT REFERENCES categories(id),
  crawl_interval INTEGER DEFAULT 3600,
  last_crawled_at TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 审核日志表
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  target_type TEXT NOT NULL CHECK(target_type IN ('article', 'comment', 'user')),
  target_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('approve', 'reject', 'hide', 'delete', 'ban', 'unban')),
  operator_id TEXT REFERENCES users(id),
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- 年龄验证表
CREATE TABLE age_verifications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  is_verified INTEGER DEFAULT 0,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ==============================
-- 索引
-- ==============================
CREATE INDEX idx_articles_category ON articles(category_id, status, published_at DESC);
CREATE INDEX idx_articles_status ON articles(status, published_at DESC);
CREATE INDEX idx_articles_language ON articles(language, status);
CREATE INDEX idx_comments_article ON comments(article_id, status, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_likes_user ON likes(user_id, target_type);
CREATE INDEX idx_likes_target ON likes(target_type, target_id);
CREATE INDEX idx_favorites_user ON favorites(user_id, created_at DESC);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_audit_target ON audit_logs(target_type, target_id);
CREATE INDEX idx_crawl_active ON crawl_sources(is_active, last_crawled_at);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(session_token);

-- ==============================
-- 初始数据：七大版块
-- ==============================
INSERT INTO categories (id, name, name_en, slug, icon, sort_order, is_adult, is_visible) VALUES
  ('cat_tech', '科技', 'Technology', 'tech', 'Cpu', 1, 0, 1),
  ('cat_society', '社会', 'Society', 'society', 'Globe', 2, 0, 1),
  ('cat_emotion', '情感', 'Emotion', 'emotion', 'Heart', 3, 0, 1),
  ('cat_gossip', '明星八卦', 'Celebrity Gossip', 'gossip', 'Star', 4, 0, 1),
  ('cat_media', '音视频', 'Audio & Video', 'media', 'Play', 5, 0, 1),
  ('cat_sports', '体育', 'Sports', 'sports', 'Trophy', 6, 0, 1),
  ('cat_adult', '成人', 'Adult', 'adult', 'ShieldAlert', 7, 1, 1);
