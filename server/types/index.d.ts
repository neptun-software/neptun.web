declare module 'nuxt/schema' {
  /*
  // Cause: types do not exist in the routes folder somehow...
  xxx\server\routes\auth\github.app.get.ts
  10:26  error  Unsafe member access .app on an `any` value  ts/no-unsafe-member-access
  11:31  error  Unsafe member access .app on an `any` value  ts/no-unsafe-member-access
  13:31  error  Unsafe member access .app on an `any` value  ts/no-unsafe-member-access
  14:35  error  Unsafe member access .app on an `any` value  ts/no-unsafe-member-access
  17:29  error  Unsafe member access .app on an `any` value  ts/no-unsafe-member-access
  */

  // Defining them here doesn't fix the issue, since RuntimeConfig is not available in the routes folder at all.
  interface RuntimeConfig { }
}

export {}
