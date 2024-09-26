import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { Client as NeonPostgres } from '@neondatabase/serverless'
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless'
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator'
import { connectionString, databaseMap } from './db'
import { IS_DEV, IS_SERVERLESS } from './globals'; // needed, if run as package.json script

async function migrateDatabase() {
  if (IS_SERVERLESS) {
    const migrationClient = new NeonPostgres(connectionString);

    const drizzleClient = neonDrizzle(migrationClient, {
      schema: databaseMap
    })

    return await neonMigrate(drizzleClient, {
      migrationsFolder: 'server/database/migrations'
    })
      .then(() => {
        if (IS_DEV) console.info('Migrated database...');
        return true;
      })
      .catch((e) => {
        if (IS_DEV) console.error('Failed to migrate database:', e);
        /* throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to migrate database',
          fatal: true,
        }); */
      })
      .finally(async () => {
        if (IS_DEV) console.info('Closing database connection...');
        await migrationClient.end();
      })
  }

  const migrationClient = postgres(connectionString, { max: 1 });

  const drizzleClient = drizzle(migrationClient, {
    schema: databaseMap
  })

  return await migrate(drizzleClient, {
    migrationsFolder: 'server/database/migrations'
  })
    .then(() => {
      if (IS_DEV) console.info('Migrated database...');
      return true;
    })
    .catch((e) => {
      if (IS_DEV) console.error('Failed to migrate database:', e);
      /* throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to migrate database',
        fatal: true,
      }); */
    })
    .finally(async () => {
      if (IS_DEV) console.info('Closing database connection...');
      await migrationClient.end();
    })
}

export default migrateDatabase;

(async () => {
  // for package.json script
  await migrateDatabase();
})();
