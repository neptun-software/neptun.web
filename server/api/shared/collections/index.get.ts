import { readAllTemplateCollections } from '~/server/database/repositories/userTemplateCollections'

// Read all template collections including their files (templates)
export default defineCachedEventHandler(async (event) => {
  // Get is_shared from query parameter, if not provided, return all collections
  const query = getQuery(event)
  const is_shared = query.is_shared === undefined || query.is_shared === null || query.is_shared === 'undefined' || query.is_shared === 'null'
    ? null
    : query.is_shared === 'true'

  const collections = await readAllTemplateCollections(is_shared)

  return {
    collections,
    total: collections.length,
  }
})
