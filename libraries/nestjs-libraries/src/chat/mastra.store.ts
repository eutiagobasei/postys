import { PostgresStore, PgVector } from '@mastra/pg';

export const pStore = new PostgresStore({
  id: 'postys-store',
  connectionString: process.env.DATABASE_URL!,
});
