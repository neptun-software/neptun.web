import { readAllTemplateCollections } from '~/server/database/repositories/userTemplateCollections'

// Read all template collections including their files (templates)
export default defineCachedEventHandler(async (event) => {
  const collections = await readAllTemplateCollections()

  return {
    collections,
    total: collections.length,
  }
})
