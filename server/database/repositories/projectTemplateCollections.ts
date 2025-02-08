import { and, eq } from 'drizzle-orm'
import { project_template_collection, ReadProject, ReadTemplateCollection } from '../../../lib/types/database.tables/schema'

export async function createProjectTemplateCollection(
  project_id: ReadProject['id'],
  template_collection_id: ReadTemplateCollection['id']
) {
  const created = await db
    .insert(project_template_collection)
    .values({
      project_id,
      template_collection_id,
    })
    .returning()
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to create project template collection:', err)
      }
      return null
    })

  if (!created) {
    return null
  }
  return created[0]
}

export async function readProjectTemplateCollectionsByProjectId(project_id: ReadProject['id']) {
  const collections = await db
    .select()
    .from(project_template_collection)
    .where(eq(project_template_collection.project_id, project_id))
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project template collections:', err)
      }
      return null
    })

  if (!collections) {
    return null
  }
  return collections
}

export async function readProjectTemplateCollection(
  project_id: ReadProject['id'],
  template_collection_id: ReadTemplateCollection['id']
) {
  const collection = await db
    .select()
    .from(project_template_collection)
    .where(
      and(
        eq(project_template_collection.project_id, project_id),
        eq(project_template_collection.template_collection_id, template_collection_id)
      )
    )
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read project template collection:', err)
      }
      return null
    })

  if (!collection) {
    return null
  }
  return collection[0]
}

export async function deleteProjectTemplateCollection(
  project_id: ReadProject['id'],
  template_collection_id: ReadTemplateCollection['id']
) {
  return await db
    .delete(project_template_collection)
    .where(
      and(
        eq(project_template_collection.project_id, project_id),
        eq(project_template_collection.template_collection_id, template_collection_id)
      )
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete project template collection:', err)
      }
      return false
    })
}
