import { Pool } from 'pg';

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
