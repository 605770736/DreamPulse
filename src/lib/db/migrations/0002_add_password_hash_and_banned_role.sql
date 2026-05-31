-- ==============================
-- DreamPulse D1 增量迁移脚本
-- 版本: 0002
-- 日期: 2026-05-30
-- 说明: 添加 password_hash 字段 + role 增加 'banned' 值
-- ==============================

-- password_hash 已在 0001 建表时定义，无需 ALTER TABLE
-- 更新 role 约束：支持 'banned' 状态
-- SQLite 不支持 ALTER COLUMN，需要重建表
-- 步骤：创建新表 → 迁移数据 → 删除旧表 → 重命名

CREATE TABLE users_new (
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

INSERT INTO users_new (id, email, name, avatar_url, role, locale, age_verified, phone, password_hash, created_at, updated_at)
  SELECT id, email, name, avatar_url, role, locale, age_verified, phone, password_hash, created_at, updated_at
  FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;

-- 重建索引
CREATE INDEX idx_users_email ON users(email);
