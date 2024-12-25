import type {
  TemplateCollectionToCreate } from '~/lib/types/database.tables/schema'
import { eq } from 'drizzle-orm'
import {
  neptun_user_template_collection,
} from '~/lib/types/database.tables/schema'

export async function readTemplateCollection(share_uuid: string) {
  const collection = await db.query.neptun_user_template_collection.findFirst({
    where: eq(neptun_user_template_collection.share_uuid, share_uuid),
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

export async function readAllTemplateCollections(is_shared: boolean | null) {
  const collections = await db.query.neptun_user_template_collection.findMany({
    where: is_shared !== null
      ? eq(neptun_user_template_collection.is_shared, is_shared)
      : undefined,
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

export async function createTemplateCollection(data: TemplateCollectionToCreate) {
  const [collection] = await db.insert(neptun_user_template_collection)
    .values({
      name: data.name,
      description: data.description,
      is_shared: data.is_shared,
      neptun_user_id: data.neptun_user_id,
    })
    .returning()

  return collection
}

export async function updateTemplateCollection(share_uuid: string, data: Partial<TemplateCollectionToCreate>) {
  const [collection] = await db.update(neptun_user_template_collection)
    .set({
      name: data.name,
      description: data.description,
      is_shared: data.is_shared,
    })
    .where(eq(neptun_user_template_collection.share_uuid, share_uuid))
    .returning()

  return collection
}

export async function deleteTemplateCollection(id: string) {
  await db.delete(neptun_user_template_collection).where(eq(neptun_user_template_collection.share_uuid, id))
}
