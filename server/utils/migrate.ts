import { Client as NeonPostgres } from '@neondatabase/serverless'
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless'
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator'
import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import { databaseMap } from './db'
import { IS_DEV, IS_SERVERLESS } from './globals' // needed, if run as package.json script

const environment = process.argv[2]?.split('=')[1] || 'dev'
console.log('Running migrations for environment:', environment)
if (IS_DEV) {
  console.log('Database connection string:', process.env.DEVELOPMENT_DATABASE_CONNECTION_STRING)
}
console.log()

export const databaseMigrationConnectionString = (environment === 'prod'
  ? process.env.PRODUCTION_DATABASE_CONNECTION_STRING
  : process.env.DEVELOPMENT_DATABASE_CONNECTION_STRING)
|| 'postgresql://postgres:postgres@localhost:5432/postgres'
export const migrationFolder = (environment === 'prod'
  ? './server/database/migrations-prod'
  : './server/database/migrations-dev')

async function migrateDatabase() {
  if (IS_SERVERLESS) {
    const migrationClient = new NeonPostgres(databaseMigrationConnectionString)

    const drizzleClient = neonDrizzle(migrationClient, {
      schema: databaseMap,
    })

    return neonMigrate(drizzleClient, {
      migrationsFolder: migrationFolder,
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

  const migrationClient = postgres(databaseMigrationConnectionString, { max: 1 })

  const drizzleClient = drizzle(migrationClient, {
    schema: databaseMap,
  })

  return migrate(drizzleClient, {
    migrationsFolder: migrationFolder,
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

if (require.main === module || import.meta.url === import.meta.resolve('./migrate.ts')) {
  void (async () => {
    try {
      await migrateDatabase()
      process.exit(0)
    } catch (error) {
      console.error('Failed to migrate database:', error)
      process.exit(1)
    }
  })()
}
