import type {
  ReadTemplateCollection,
  TemplateCollectionToCreate } from '~/lib/types/database.tables/schema'
import { and, eq, sql } from 'drizzle-orm'
import {
  neptun_user_template_collection,
} from '~/lib/types/database.tables/schema'

export async function readTemplateCollection(collection_id: ReadTemplateCollection['id'] | ReadTemplateCollection['share_uuid'], {
  is_shared = null,
  user_id = null,
}: {
  is_shared?: boolean | null
  user_id?: number | null
}) {
  const conditions = []

  // When accessing via UUID, always require is_shared to be true
  if (typeof collection_id === 'string') {
    conditions.push(
      and(
        eq(neptun_user_template_collection.share_uuid, collection_id),
        eq(neptun_user_template_collection.is_shared, true)
      )
    )
  } else {
    conditions.push(eq(neptun_user_template_collection.id, collection_id))

    // Only apply is_shared check for numeric IDs if explicitly requested
    if (is_shared !== null) {
      conditions.push(eq(neptun_user_template_collection.is_shared, is_shared))
    }
  }

  if (user_id !== null) {
    conditions.push(eq(neptun_user_template_collection.neptun_user_id, user_id))
  }

  const collection = await db.query.neptun_user_template_collection.findFirst({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      templates: {
        with: {
          neptun_user_file: true,
        },
        columns: {
          id: true,
          description: true,
          file_name: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      description: true,
      is_shared: true,
      created_at: true,
      updated_at: true,
    },
  })

  if (!collection || !collection.templates) {
    return null
  }

  return {
    ...collection,
    templates: collection.templates
      .map(template => ({
        ...template,
        title: template.neptun_user_file?.title,
        text: template.neptun_user_file?.text,
        language: template.neptun_user_file?.language || 'text',
        extension: template.neptun_user_file?.extension || 'txt',
      })),
  }
}

export async function readAllTemplateCollections({
  is_shared = null,
  user_id = null,
  name = null,
}: {
  is_shared?: boolean | null
  user_id?: number | null
  name?: string | null
}) {
  const conditions = []

  if (is_shared !== null) {
    conditions.push(eq(neptun_user_template_collection.is_shared, is_shared))
  }
  if (user_id !== null) {
    conditions.push(eq(neptun_user_template_collection.neptun_user_id, user_id))
  }
  if (name !== null) {
    conditions.push(sql`LOWER(${neptun_user_template_collection.name}) LIKE LOWER(${`%${name}%`})`)
  }

  const collections = await db.query.neptun_user_template_collection.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      templates: {
        with: {
          neptun_user_file: true,
        },
        columns: {
          id: true,
          description: true,
          file_name: true,
          created_at: true,
          updated_at: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      description: true,
      is_shared: true,
      share_uuid: true,
      created_at: true,
      updated_at: true,
    },
  })

  return collections.map(collection => ({
    ...collection,
    templates: collection.templates.map(template => ({
      ...template,
      title: template.neptun_user_file?.title,
      text: template.neptun_user_file?.text,
      language: template.neptun_user_file?.language || 'text',
      extension: template.neptun_user_file?.extension || 'txt',
    })),
  }))
}

export async function createTemplateCollection(collection_entry: TemplateCollectionToCreate) {
  const [collection] = await db.insert(neptun_user_template_collection)
    .values({
      name: collection_entry.name,
      description: collection_entry.description,
      is_shared: collection_entry.is_shared,
      neptun_user_id: collection_entry.neptun_user_id,
    })
    .returning()

  return collection
}

export async function updateTemplateCollection(collection_id: ReadTemplateCollection['id'], collection_entry: Partial<TemplateCollectionToCreate>) {
  const [collection] = await db.update(neptun_user_template_collection)
    .set({
      name: collection_entry.name,
      description: collection_entry.description,
      is_shared: collection_entry.is_shared,
    })
    .where(eq(neptun_user_template_collection.id, collection_id))
    .returning()

  return collection
}

export async function deleteTemplateCollection(collection_id: ReadTemplateCollection['id']) {
  return db
    .delete(neptun_user_template_collection)
    .where(eq(neptun_user_template_collection.id, collection_id))
    .then(() => true)
    .catch((err) => {
      if (LOG_BACKEND) {
        console.error('Failed to delete template collection from database', err)
      }
      return false
    })
}
