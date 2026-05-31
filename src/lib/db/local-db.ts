import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), '.local', 'dreampulse.db');
const MIGRATIONS_DIR = path.join(process.cwd(), 'src', 'lib', 'db', 'migrations');

let initPromise: Promise<void> | null = null;
let client: ReturnType<typeof createClient> | null = null;

async function init() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  client = createClient({ url: `file:${DB_PATH}` });

  await client.execute(`CREATE TABLE IF NOT EXISTS _migrations (
    name TEXT PRIMARY KEY,
    applied_at TEXT DEFAULT (datetime('now'))
  )`);

  const applied = await client.execute('SELECT name FROM _migrations ORDER BY name');
  const appliedSet = new Set(applied.rows.map((r: Record<string, unknown>) => r.name as string));

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (appliedSet.has(file)) continue;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    await client.executeMultiple(sql);
    await client.execute({ sql: 'INSERT INTO _migrations (name) VALUES (?)', args: [file] });
  }
}

function ensureInit() {
  if (!initPromise) {
    initPromise = init();
  }
  return initPromise;
}

class LocalDatabase {
  prepare(sql: string) {
    return new LocalPreparedStatement(sql);
  }

  async batch(statements: { bind: (...args: unknown[]) => { run: () => Promise<D1Result> } }[]) {
    const results: D1Result[] = [];
    for (const stmt of statements) {
      const result = await stmt.bind().run();
      results.push(result);
    }
    return results;
  }
}

class LocalPreparedStatement {
  private sql: string;
  private params: unknown[] = [];

  constructor(sql: string) {
    this.sql = sql;
  }

  bind(...args: unknown[]) {
    this.params = args;
    return this;
  }

  async all<T = Record<string, unknown>>() {
    await ensureInit();
    const result = await client!.execute({ sql: this.sql, args: this.params as any });
    return { results: result.rows as T[] };
  }

  async first<T = Record<string, unknown>>() {
    await ensureInit();
    const result = await client!.execute({ sql: this.sql, args: this.params as any });
    return (result.rows[0] as T) ?? null;
  }

  async run() {
    await ensureInit();
    const result = await client!.execute({ sql: this.sql, args: this.params as any });
    return {
      success: true,
      meta: {
        changes: result.rowsAffected,
        last_row_id: result.lastInsertRowid as number | undefined,
      },
    } as D1Result;
  }
}

class LocalBucket {
  private store = new Map<string, { data: ArrayBuffer; metadata: Record<string, string> }>();

  async put(key: string, value: ArrayBuffer | ReadableStream, options?: { httpMetadata?: Record<string, string> }) {
    this.store.set(key, {
      data: value instanceof ArrayBuffer ? value : new ArrayBuffer(0),
      metadata: options?.httpMetadata ?? {},
    });
  }

  async get(key: string) {
    const entry = this.store.get(key);
    if (!entry) return null;
    return {
      body: entry.data,
      httpMetadata: entry.metadata,
      writeHttpMetadata(headers: Headers) {
        for (const [k, v] of Object.entries(entry.metadata)) {
          headers.set(k, v);
        }
      },
    } as unknown as R2ObjectBody;
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

class LocalKV {
  private store = new Map<string, string>();

  async get(key: string) {
    return this.store.get(key) ?? null;
  }

  async put(key: string, value: string) {
    this.store.set(key, value);
  }

  async delete(key: string) {
    this.store.delete(key);
  }
}

export function createLocalEnv() {
  return {
    DB: new LocalDatabase() as unknown as D1Database,
    R2: new LocalBucket() as unknown as R2Bucket,
    KV: new LocalKV() as unknown as KVNamespace,
  };
}
