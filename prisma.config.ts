import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Use DIRECT_URL for migrations (pgbouncer doesn't support DDL).
    // Falls back to DATABASE_URL for environments without a separate direct connection.
    url: process.env['DIRECT_URL'] || process.env['DATABASE_URL'],
  },
});
