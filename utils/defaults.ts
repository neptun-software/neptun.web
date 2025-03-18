/**
 * Execute a function and return its result, or a default value if an error occurs
 */
export function withDefaultOnError<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn()
  } catch (error) {
    return defaultValue
  }
}
