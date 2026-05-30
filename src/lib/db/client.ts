/**
 * D1 客户端工具函数
 * 封装 getRequestContext，提供类型安全的数据库访问
 */

import { getRequestContext } from '@cloudflare/next-on-pages';
import type { D1Env } from './schema';

/**
 * 获取 Cloudflare 环境绑定
 * 包含 D1 数据库、R2 存储桶、KV 命名空间
 *
 * @returns D1Env 类型安全的环境绑定对象
 * @throws 如果在非 Cloudflare 环境中调用
 *
 * @example
 * ```ts
 * const { DB, R2, KV } = getEnv();
 * const result = await DB.prepare('SELECT * FROM articles LIMIT 20').all();
 * ```
 */
export function getEnv(): D1Env {
  const { env } = getRequestContext();
  return env as unknown as D1Env;
}

/**
 * 获取 D1 数据库实例
 * 等价于 getEnv().DB 的快捷方法
 *
 * @returns D1Database 数据库实例
 *
 * @example
 * ```ts
 * const db = getDB();
 * const articles = await db.prepare('SELECT * FROM articles WHERE status = ? LIMIT ?').bind('published', 20).all();
 * ```
 */
export function getDB(): D1Database {
  const { DB } = getEnv();
  return DB;
}

/**
 * 获取 R2 存储桶实例
 * 等价于 getEnv().R2 的快捷方法
 *
 * @returns R2Bucket 存储桶实例
 */
export function getR2(): R2Bucket {
  const { R2 } = getEnv();
  return R2;
}

/**
 * 获取 KV 命名空间实例
 * 等价于 getEnv().KV 的快捷方法
 *
 * @returns KVNamespace 命名空间实例
 */
export function getKV(): KVNamespace {
  const { KV } = getEnv();
  return KV;
}

/**
 * 执行 D1 查询并返回结果列表
 * 自动解包 D1Result，直接返回记录数组
 *
 * @param sql - SQL 查询语句
 * @param params - 绑定参数
 * @returns 查询结果记录数组
 *
 * @example
 * ```ts
 * const articles = await query<ArticleRow>(
 *   'SELECT * FROM articles WHERE status = ? ORDER BY published_at DESC LIMIT ?',
 *   'published', 20
 * );
 * ```
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  const db = getDB();
  const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
  const result = await stmt.all<T>();
  return result.results;
}

/**
 * 执行 D1 单行查询
 * 返回第一条匹配记录，若无匹配则返回 null
 *
 * @param sql - SQL 查询语句
 * @param params - 绑定参数
 * @returns 单条记录或 null
 *
 * @example
 * ```ts
 * const article = await queryOne<ArticleRow>(
 *   'SELECT * FROM articles WHERE id = ?',
 *   articleId
 * );
 * ```
 */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T | null> {
  const db = getDB();
  const stmt = db.prepare(sql).bind(...params);
  const result = await stmt.first<T>();
  return result ?? null;
}

/**
 * 执行 D1 写入操作（INSERT/UPDATE/DELETE）
 * 返回受影响的行数等信息
 *
 * @param sql - SQL 写入语句
 * @param params - 绑定参数
 * @returns D1 执行结果
 *
 * @example
 * ```ts
 * await execute(
 *   'INSERT INTO articles (id, title, summary, original_url, original_source, category_id) VALUES (?, ?, ?, ?, ?, ?)',
 *   id, title, summary, url, source, categoryId
 * );
 * ```
 */
export async function execute(
  sql: string,
  ...params: unknown[]
): Promise<D1Result> {
  const db = getDB();
  const stmt = db.prepare(sql).bind(...params);
  return stmt.run();
}

/**
 * 批量执行 D1 操作（事务）
 * 所有语句在一个事务中执行，任一失败则全部回滚
 *
 * @param statements - D1PreparedStatement 数组
 * @returns 批量执行结果
 *
 * @example
 * ```ts
 * const db = getDB();
 * await batch([
 *   db.prepare('UPDATE articles SET view_count = view_count + 1 WHERE id = ?').bind(articleId),
 *   db.prepare('INSERT INTO audit_logs (target_type, target_id, action) VALUES (?, ?, ?)').bind('article', articleId, 'view'),
 * ]);
 * ```
 */
export async function batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
  const db = getDB();
  return db.batch(statements);
}
