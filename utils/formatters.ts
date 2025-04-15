export function titleCase(text: string) {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/* Intl.<someFormatter> */

export function convertStringsToDates<T>(data: T): T {
  if (data === null || typeof data !== 'object') {
    return data
  }

  if (Array.isArray(data)) {
    const array = data as unknown[]
    return array.map(item => convertStringsToDates(item)) as unknown as T
  }

  const result = { ...data }

  for (const [key, value] of Object.entries(result)) {
    if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
      (result as Record<string, unknown>)[key] = new Date(value)
    } else if (value !== null && typeof value === 'object') {
      (result as Record<string, unknown>)[key] = convertStringsToDates(value)
    }
  }

  return result as T
}
