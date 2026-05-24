import { Pool, PoolClient } from 'pg';

const globalForPool = globalThis as unknown as {
  pool?: Pool;
};

const pool = globalForPool.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== 'production') globalForPool.pool = pool;

export const db = pool;

export async function withTransaction<T>(
  fn: (query: (text: string, values?: any[]) => Promise<any>) => Promise<T>
): Promise<T> {
  const client: PoolClient = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await fn((text, values) => client.query(text, values));
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}