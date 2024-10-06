export const IS_DEV = import.meta.dev;
export const IS_SERVERLESS
  = JSON.parse(process.env.IS_SERVERLESS ?? 'false') ?? false; // process.env.DATABASE_CONNECTION_STRING?.includes("neon.tech") && !IS_DEV (serverless doesn't work in a serverless environment and times out :|)
// export const IS_TEST = import.meta.test;

export const LOG_SQL_QUERIES = JSON.parse(
  process.env.LOG_SQL_QUERIES ?? 'false'
);
export const LOG_BACKEND = JSON.parse(process.env.LOG_BACKEND ?? 'false');

export const ENCRYPTION_SECRET = process.env.CRYPTO_SECRET ?? 'secret';

if (IS_DEV) {
  console.info(
    `IS_SERVERLESS: ${IS_SERVERLESS} \nLOG_SQL_QUERIES: ${LOG_SQL_QUERIES} \nLOG_BACKEND: ${LOG_BACKEND}`
  );
}
