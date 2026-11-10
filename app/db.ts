
import { Pool } from "pg";

const globalForPg = globalThis as typeof globalThis & {
  scorpionPool?: Pool;
};

export function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL não configurada.");
  }

  if (!globalForPg.scorpionPool) {
    globalForPg.scorpionPool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  return globalForPg.scorpionPool;
}
