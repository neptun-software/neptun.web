import { Client as NeonPostgres } from '@neondatabase/serverless'
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless'
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { connectionString, databaseMap } from './db'
import { IS_DEV, IS_SERVERLESS } from './globals' // needed, if run as package.json script

async function migrateDatabase() {
  if (IS_SERVERLESS) {
    const migrationClient = new NeonPostgres(connectionString)

    const drizzleClient = neonDrizzle(migrationClient, {
      schema: databaseMap,
    })

    return neonMigrate(drizzleClient, {
      migrationsFolder: 'server/database/migrations',
    })
      .then(() => {
        if (IS_DEV) {
          console.info('Migrated database...')
        }
        return true
      })
      .catch((e) => {
        if (IS_DEV) {
          console.error('Failed to migrate database:', e)
        }
        /* throw createError({
          statusCode: 500,
          statusMessage: 'Internal Server Error',
          message: 'Failed to migrate database',
          fatal: true,
        }); */
      })
      .finally(() => {
        if (IS_DEV) {
          console.info('Closing database connection...')
        }
        void migrationClient.end()
      })
  }

  const migrationClient = postgres(connectionString, { max: 1 })

  const drizzleClient = drizzle(migrationClient, {
    schema: databaseMap,
  })

  return migrate(drizzleClient, {
    migrationsFolder: 'server/database/migrations',
  })
    .then(() => {
      if (IS_DEV) {
        console.info('Migrated database...')
      }
      return true
    })
    .catch((e) => {
      if (IS_DEV) {
        console.error('Failed to migrate database:', e)
      }
      return false
    })
    .finally(() => {
      if (IS_DEV) {
        console.info('Closing database connection...')
      }
      void migrationClient.end()
    })
}

export default migrateDatabase

void (async () => {
  try {
    await migrateDatabase()
    process.exit(0)
  } catch (error) {
    console.error('Failed to migrate database:', error)
    process.exit(1)
  }
})()
