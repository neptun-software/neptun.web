import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/types/database.tables/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_CONNECTION_STRING
      || 'postgresql://postgres:postgres@localhost:5432/postgres',
  },
  verbose: false,
})
