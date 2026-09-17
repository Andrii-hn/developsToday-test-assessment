import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { attachDatabasePool } from '@vercel/functions';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required. Set it in backend/.env.');
}

const pool = new Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 5000,
  connectionTimeoutMillis: 10000,
});

// Release idle connections before Vercel suspends the function instance.
if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

const adapter = new PrismaPg(pool, { disposeExternalPool: true });

export const prisma = new PrismaClient({ adapter });
