import type { ColumnBaseConfig, ColumnDataType, Logger } from 'drizzle-orm'
import type { PgColumn } from 'drizzle-orm/pg-core'
import { Client as NeonPostgres } from '@neondatabase/serverless'
import { sql } from 'drizzle-orm'
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as relations from '../../lib/types/database.tables/relations'
import * as schema from '../../lib/types/database.tables/schema'
import { ENCRYPTION_SECRET, IS_SERVERLESS, LOG_SQL_QUERIES } from './globals' // needed for package.json script (#imports is not available outside nitro/nuxt)

// TODO: set the drivers as optional dependencies and only import the needed one dynamically (might be a worse idea, than leaving it like this)

class MinimalLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (query.includes('INFO')) {
      return
    }

    if (/^(?:select|insert|update|delete|merge|with)/i.test(query.trim())) {
      console.info(`${query} ${JSON.stringify(params)}`)
    }
  }
}

export const connectionString
  = process.env.DATABASE_CONNECTION_STRING
    || 'postgresql://postgres:postgres@localhost:5432/postgres'
export const databaseMap = {
  ...schema,
  ...relations,
}

export const db = IS_SERVERLESS
  ? neonDrizzle(new NeonPostgres(connectionString), {
    schema: databaseMap,
    logger: LOG_SQL_QUERIES ? new MinimalLogger() : false,
  })
  : drizzle(postgres(connectionString), {
    schema: databaseMap,
    logger: LOG_SQL_QUERIES ? new MinimalLogger() : false,
  })

export function encryptColumn(value: any) {
  return sql<string>`encode(encrypt(${value}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`
}

export function decryptColumn<
  T extends ColumnBaseConfig<ColumnDataType, string>,
>(column: PgColumn<T>) {
  return sql<string>`encode(decrypt(decode(${column}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`
}

export function encryptSecret(secret: any) {
  return sql<string>`crypt(${secret}, gen_salt('bf', 12))`
}

/**
 * Is value equal to that stored secret?
 */
export function compareWithSecret<
  T extends ColumnBaseConfig<ColumnDataType, string>,
>(value: any, column: PgColumn<T>) {
  return sql<string>`crypt(${value}, ${column})`
}
