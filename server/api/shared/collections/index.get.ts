import { readAllTemplateCollections } from '~/server/database/repositories/userTemplateCollections'

// Read all shared template collections including their files (templates)
export default defineCachedEventHandler(async (_event) => {
  const collections = await readAllTemplateCollections({
    is_shared: true,
  })

  return {
    collections,
    total: collections.length,
  }
})
