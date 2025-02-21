import type { ReadProject, ReadTemplateCollection } from '../../../lib/types/database.tables/schema'
import { and, eq } from 'drizzle-orm'
import { neptun_user_template_collection, project_template_collection } from '../../../lib/types/database.tables/schema'

export async function createProjectTemplateCollection(
  project_id: ReadProject['id'],
  template_collection_id: ReadTemplateCollection['id'],
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

  const collection = await db
    .select()
    .from(neptun_user_template_collection)
    .where(eq(neptun_user_template_collection.id, template_collection_id))
    .limit(1)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to read template collection:', err)
      }
      return null
    })

  if (!collection) {
    return null
  }
  return collection[0]
}

export async function readAllProjectTemplateCollections(project_id: ReadProject['id']) {
  const collections = await db
    .select({
      id: neptun_user_template_collection.id,
      name: neptun_user_template_collection.name,
      description: neptun_user_template_collection.description,
      is_shared: neptun_user_template_collection.is_shared,
      share_uuid: neptun_user_template_collection.share_uuid,
      created_at: neptun_user_template_collection.created_at,
      updated_at: neptun_user_template_collection.updated_at,
      neptun_user_id: neptun_user_template_collection.neptun_user_id,
    })
    .from(project_template_collection)
    .innerJoin(
      neptun_user_template_collection,
      eq(project_template_collection.template_collection_id, neptun_user_template_collection.id),
    )
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
  template_collection_id: ReadTemplateCollection['id'],
) {
  const collection = await db
    .select({
      id: neptun_user_template_collection.id,
      name: neptun_user_template_collection.name,
      description: neptun_user_template_collection.description,
      is_shared: neptun_user_template_collection.is_shared,
      share_uuid: neptun_user_template_collection.share_uuid,
      created_at: neptun_user_template_collection.created_at,
      updated_at: neptun_user_template_collection.updated_at,
      neptun_user_id: neptun_user_template_collection.neptun_user_id,
    })
    .from(project_template_collection)
    .innerJoin(
      neptun_user_template_collection,
      eq(project_template_collection.template_collection_id, neptun_user_template_collection.id),
    )
    .where(
      and(
        eq(project_template_collection.project_id, project_id),
        eq(project_template_collection.template_collection_id, template_collection_id),
      ),
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
  template_collection_id: ReadTemplateCollection['id'],
) {
  return db
    .delete(project_template_collection)
    .where(
      and(
        eq(project_template_collection.project_id, project_id),
        eq(project_template_collection.template_collection_id, template_collection_id),
      ),
    )
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete project template collection:', err)
      }
      return false
    })
}
