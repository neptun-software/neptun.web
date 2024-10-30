import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { Client as NeonPostgres } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { type ColumnBaseConfig, type ColumnDataType, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';
import * as schema from '../../lib/types/database.tables/schema';
import * as relations from '../../lib/types/database.tables/relations';
import { IS_SERVERLESS, ENCRYPTION_SECRET, LOG_SQL_QUERIES } from './globals'; // needed for package.json script (#imports is not available outside nitro/nuxt)

// TODO: set the drivers as optional dependencies and only import the needed one dynamically (might be a worse idea, than leaving it like this)

export const connectionString =
  process.env.DATABASE_CONNECTION_STRING ||
  'postgresql://postgres:postgres@localhost:5432/postgres';
export const databaseMap = {
  ...schema,
  ...relations,
};

export const db = IS_SERVERLESS
  ? neonDrizzle(new NeonPostgres(connectionString), {
      schema: databaseMap,
      logger: LOG_SQL_QUERIES,
    })
  : drizzle(postgres(connectionString), {
      schema: databaseMap,
      logger: LOG_SQL_QUERIES,
    });

export function encryptColumn(value: any) {
  return sql<string>`encode(encrypt(${value}, ${ENCRYPTION_SECRET}, 'aes'), 'hex')`;
}

export function decryptColumn<
  T extends ColumnBaseConfig<ColumnDataType, string>,
>(column: PgColumn<T>) {
  return sql<string>`encode(decrypt(decode(${column}, 'hex'), ${ENCRYPTION_SECRET}, 'aes'), 'escape')`;
}

export function encryptSecret(secret: any) {
  return sql<string>`crypt(${secret}, gen_salt('bf', 12))`;
}

/**
 * Is value equal to that stored secret?
 */
export function compareWithSecret<
  T extends ColumnBaseConfig<ColumnDataType, string>,
>(value: any, column: PgColumn<T>) {
  return sql<string>`crypt(${value}, ${column})`;
}
