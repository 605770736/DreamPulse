import type { D1Env } from './schema';

let envPromise: Promise<D1Env> | null = null;

function getEnvPromise(): Promise<D1Env> {
  if (!envPromise) {
    envPromise = (async () => {
      if (process.env.LOCAL_DEV) {
        const { createLocalEnv } = await import('./local-db');
        return createLocalEnv() as unknown as D1Env;
      }
      const { getRequestContext } = await import('@cloudflare/next-on-pages');
      const { env } = getRequestContext();
      return env as unknown as D1Env;
    })();
  }
  return envPromise;
}

export async function getDB(): Promise<D1Database> {
  const env = await getEnvPromise();
  return env.DB;
}

export async function getR2(): Promise<R2Bucket> {
  const env = await getEnvPromise();
  return env.R2;
}

export async function getKV(): Promise<KVNamespace> {
  const env = await getEnvPromise();
  return env.KV;
}

export async function query<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T[]> {
  const db = await getDB();
  const stmt = params.length > 0 ? db.prepare(sql).bind(...params) : db.prepare(sql);
  const result = await stmt.all<T>();
  return result.results;
}

export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  ...params: unknown[]
): Promise<T | null> {
  const db = await getDB();
  const stmt = db.prepare(sql).bind(...params);
  const result = await stmt.first<T>();
  return result ?? null;
}

export async function execute(
  sql: string,
  ...params: unknown[]
): Promise<D1Result> {
  const db = await getDB();
  const stmt = db.prepare(sql).bind(...params);
  return stmt.run();
}

export async function batch(statements: D1PreparedStatement[]): Promise<D1Result[]> {
  const db = await getDB();
  return db.batch(statements);
}
